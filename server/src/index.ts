import cors from "@fastify/cors";
import Fastify from "fastify";
import process from "node:process";

process.loadEnvFile(".env");

const PORT = Number(process.env.PORT ?? 4000);
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN is not set in .env");
  process.exit(1);
}

const app = Fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
    },
  },
});

await app.register(cors, {
  origin: "http://localhost:5173",
  credentials: true,
});

app.get("/health", async () => {
  return { status: "ok" };
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
