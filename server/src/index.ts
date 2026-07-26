import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";
import crypto from "node:crypto";
import process from "node:process";

process.loadEnvFile(".env");

const PORT = Number(process.env.PORT ?? 4000);
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;
const COOKIE_SECRET = process.env.COOKIE_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

const requiredEnv = {
  GITHUB_TOKEN,
  GITHUB_OAUTH_CLIENT_ID,
  GITHUB_OAUTH_CLIENT_SECRET,
  COOKIE_SECRET,
};

for (const [key, value] of Object.entries(requiredEnv)) {
  if (!value) {
    console.error(`${key} is not set in .env`);
    process.exit(1);
  }
}

// In-memory session store — sessionId → { githubToken, userId }
// Replace with Redis / database for production.
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

app.get("/health", async () => ({ status: "ok" }));

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

app.get<{ Querystring: { code?: string; state?: string; error?: string } }>(
  "/auth/callback",
  async (request, reply) => {
    const { code, state: returnedState, error } = request.query;

    // If GitHub sent an error, redirect back with a message
    if (error) {
      return reply.redirect(
        `${FRONTEND_URL}/?auth_error=${encodeURIComponent(error)}`,
      );
    }

    if (!code || !returnedState) {
      return reply.redirect(`${FRONTEND_URL}/?auth_error=missing_params`);
    }

    // Verify the state matches what we saved (CSRF check)
    const savedState = request.unsignCookie(request.cookies.oauth_state ?? "");
    if (!savedState.valid || savedState.value !== returnedState) {
      return reply.redirect(`${FRONTEND_URL}/?auth_error=state_mismatch`);
    }

    // Retrieve the PKCE code verifier
    const savedVerifier = request.unsignCookie(
      request.cookies.oauth_verifier ?? "",
    );
    if (!savedVerifier.valid || !savedVerifier.value) {
      return reply.redirect(`${FRONTEND_URL}/?auth_error=missing_verifier`);
    }

    // Exchange the code for an access token
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

    // Fetch the user's basic info so we know who they are
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

    // Create a session
    const sessionId = crypto.randomBytes(32).toString("base64url");
    sessions.set(sessionId, {
      githubToken: tokenData.access_token,
      githubLogin: login,
      createdAt: Date.now(),
    });

    // Clear the temp OAuth cookies
    reply.clearCookie("oauth_state", { path: "/" });
    reply.clearCookie("oauth_verifier", { path: "/" });

    // Set the real session cookie
    reply.setCookie("session_id", sessionId, {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      signed: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return reply.redirect(FRONTEND_URL);
  },
);

app.post("/api/graphql", async (request, reply) => {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
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
