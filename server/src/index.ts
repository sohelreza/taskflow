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
