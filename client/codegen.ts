import type { CodegenConfig } from "@graphql-codegen/cli";
import process from "node:process";

process.loadEnvFile(".env.local");

const config: CodegenConfig = {
  schema: {
    "https://api.github.com/graphql": {
      headers: {
        Authorization: `Bearer ${process.env.VITE_GITHUB_TOKEN}`,
      },
    },
  },
  documents: ["src/**/*.{ts,tsx}", "!src/gql/**/*"],
  generates: {
    "./src/gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        useTypeImports: true,
        scalars: {
          URI: "string",
          DateTime: "string",
          HTML: "string",
          GitObjectID: "string",
          GitTimestamp: "string",
          Date: "string",
          GitSSHRemote: "string",
          PreciseDateTime: "string",
          X509Certificate: "string",
          Base64String: "string",
          BigInt: "string",
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
