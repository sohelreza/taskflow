import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyError } from "fastify";
import Fastify from "fastify";
import crypto from "node:crypto";
import fs from "node:fs";
import process from "node:process";

// Load .env.test if NODE_ENV=test, else .env
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
if (fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
  console.log(`Loaded ${envFile}`);
} else {
  console.error(`No ${envFile} found`);
  process.exit(1);
}

const PORT = Number(process.env.PORT ?? 4000);
const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;
const COOKIE_SECRET = process.env.COOKIE_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
const TEST_MODE = process.env.TEST_MODE === "true";

const requiredEnv = {
  GITHUB_OAUTH_CLIENT_ID,
  GITHUB_OAUTH_CLIENT_SECRET,
  COOKIE_SECRET,
};

for (const [key, value] of Object.entries(requiredEnv)) {
  if (!value) {
    console.error(`${key} is not set in ${envFile}`);
    process.exit(1);
  }
}

// In-memory session store — sessionId → { githubToken, githubLogin, createdAt }
type Session = {
  githubToken: string;
  githubLogin: string;
  createdAt: number;
};

const sessions = new Map<string, Session>();

const app = Fastify({
  logger: {
    level: "info",
    transport: { target: "pino-pretty" },
  },
});

await app.register(cors, {
  origin: FRONTEND_URL,
  credentials: true,
});

await app.register(cookie, {
  secret: COOKIE_SECRET,
});

await app.register(helmet, {
  contentSecurityPolicy: false,
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// CSP hook
app.addHook("onSend", async (_request, reply) => {
  reply.header(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://avatars.githubusercontent.com https://*.githubusercontent.com",
      "connect-src 'self' https://api.github.com",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join("; "),
  );
});

// Request ID generation
app.addHook("onRequest", async (request) => {
  const requestId =
    (request.headers["x-request-id"] as string) ?? crypto.randomUUID();
  request.log = request.log.child({ requestId });
});

// Request ID response header
app.addHook("onSend", async (request, reply) => {
  const logger = request.log as unknown as {
    bindings?: () => { requestId?: string };
  };
  const requestId = logger.bindings?.().requestId;
  if (requestId) {
    reply.header("X-Request-Id", requestId);
  }
});

// Structured error handler
app.setErrorHandler(async (error: FastifyError, request, reply) => {
  request.log.error({ err: error }, "request failed");

  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      errors: [{ message: error.message }],
    });
  }

  return reply.status(500).send({
    errors: [{ message: "Internal server error" }],
  });
});

// Health check
app.get("/health", async () => ({ status: "ok" }));

// OAuth login — start the flow
app.get("/auth/login", async (_request, reply) => {
  const state = crypto.randomBytes(16).toString("hex");

  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  reply.setCookie("oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    signed: true,
    maxAge: 600,
  });

  reply.setCookie("oauth_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    signed: true,
    maxAge: 600,
  });

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", GITHUB_OAUTH_CLIENT_ID!);
  authUrl.searchParams.set(
    "redirect_uri",
    "http://localhost:4000/auth/callback",
  );
  authUrl.searchParams.set("scope", "read:user repo");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return reply.redirect(authUrl.toString());
});

// OAuth callback — exchange code for token
app.get<{ Querystring: { code?: string; state?: string; error?: string } }>(
  "/auth/callback",
  async (request, reply) => {
    const { code, state: returnedState, error } = request.query;

    if (error) {
      return reply.redirect(
        `${FRONTEND_URL}/?auth_error=${encodeURIComponent(error)}`,
      );
    }

    if (!code || !returnedState) {
      return reply.redirect(`${FRONTEND_URL}/?auth_error=missing_params`);
    }

    const savedState = request.unsignCookie(request.cookies.oauth_state ?? "");
    if (!savedState.valid || savedState.value !== returnedState) {
      return reply.redirect(`${FRONTEND_URL}/?auth_error=state_mismatch`);
    }

    const savedVerifier = request.unsignCookie(
      request.cookies.oauth_verifier ?? "",
    );
    if (!savedVerifier.valid || !savedVerifier.value) {
      return reply.redirect(`${FRONTEND_URL}/?auth_error=missing_verifier`);
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_OAUTH_CLIENT_ID,
          client_secret: GITHUB_OAUTH_CLIENT_SECRET,
          code,
          redirect_uri: "http://localhost:4000/auth/callback",
          code_verifier: savedVerifier.value,
        }),
      },
    );

    if (!tokenResponse.ok) {
      app.log.error({ status: tokenResponse.status }, "Token exchange failed");
      return reply.redirect(
        `${FRONTEND_URL}/?auth_error=token_exchange_failed`,
      );
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenData.access_token) {
      app.log.error({ tokenData }, "No access token in response");
      return reply.redirect(
        `${FRONTEND_URL}/?auth_error=${encodeURIComponent(tokenData.error ?? "unknown")}`,
      );
    }

    const viewerResponse = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "TaskFlow-BFF/0.1",
      },
      body: JSON.stringify({ query: "{ viewer { login } }" }),
    });

    const viewerData = (await viewerResponse.json()) as {
      data?: { viewer?: { login?: string } };
    };
    const login = viewerData.data?.viewer?.login;
    if (!login) {
      return reply.redirect(`${FRONTEND_URL}/?auth_error=viewer_lookup_failed`);
    }

    const sessionId = crypto.randomBytes(32).toString("base64url");
    sessions.set(sessionId, {
      githubToken: tokenData.access_token,
      githubLogin: login,
      createdAt: Date.now(),
    });

    reply.clearCookie("oauth_state", { path: "/" });
    reply.clearCookie("oauth_verifier", { path: "/" });

    reply.setCookie("session_id", sessionId, {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      signed: true,
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.redirect(FRONTEND_URL);
  },
);

// Test-mode only: bypass OAuth for E2E tests
if (TEST_MODE) {
  app.post<{ Body: { login?: string; githubToken?: string } }>(
    "/auth/test-login",
    async (request, reply) => {
      const login = request.body.login ?? "testuser";
      const githubToken = request.body.githubToken ?? "test-token-not-real";

      const sessionId = crypto.randomBytes(32).toString("base64url");
      sessions.set(sessionId, {
        githubToken,
        githubLogin: login,
        createdAt: Date.now(),
      });

      reply.setCookie("session_id", sessionId, {
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        signed: true,
        maxAge: 60 * 60 * 24 * 7,
      });

      return { authenticated: true, login };
    },
  );

  app.log.warn(
    "TEST_MODE is enabled — /auth/test-login is exposed. Do NOT run this in production.",
  );
}

// Current session info
app.get("/auth/me", async (request, reply) => {
  const sessionCookie = request.unsignCookie(request.cookies.session_id ?? "");

  if (!sessionCookie.valid || !sessionCookie.value) {
    return reply.status(401).send({ authenticated: false });
  }

  const session = sessions.get(sessionCookie.value);
  if (!session) {
    reply.clearCookie("session_id", { path: "/" });
    return reply.status(401).send({ authenticated: false });
  }

  return { authenticated: true, login: session.githubLogin };
});

// Logout
app.post("/auth/logout", async (request, reply) => {
  const sessionCookie = request.unsignCookie(request.cookies.session_id ?? "");

  if (sessionCookie.valid && sessionCookie.value) {
    sessions.delete(sessionCookie.value);
  }

  reply.clearCookie("session_id", { path: "/" });
  return { success: true };
});

// GraphQL proxy
app.post("/api/graphql", async (request, reply) => {
  const sessionCookie = request.unsignCookie(request.cookies.session_id ?? "");

  if (!sessionCookie.valid || !sessionCookie.value) {
    return reply.status(401).send({
      errors: [{ message: "Not authenticated" }],
    });
  }

  const session = sessions.get(sessionCookie.value);
  if (!session) {
    reply.clearCookie("session_id", { path: "/" });
    return reply.status(401).send({
      errors: [{ message: "Session expired" }],
    });
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.githubToken}`,
      "User-Agent": "TaskFlow-BFF/0.1",
    },
    body: JSON.stringify(request.body),
  });

  const data = await response.json();
  return reply.status(response.status).send(data);
});

try {
  await app.listen({ port: PORT, host: "127.0.0.1" });
  console.log(`Server listening on http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
