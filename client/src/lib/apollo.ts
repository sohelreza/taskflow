import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "";

const httpLink = new HttpLink({
  uri: `${SERVER_URL}/api/graphql`,
  credentials: "include",
});

const cache = new InMemoryCache({
  typePolicies: {
    User: {
      fields: {
        repositories: {
          keyArgs: ["orderBy", "affiliations", "ownerAffiliations"],
          merge(existing, incoming) {
            if (!existing) return incoming;
            return {
              ...incoming,
              nodes: [...(existing.nodes ?? []), ...(incoming.nodes ?? [])],
            };
          },
        },
      },
    },
    Repository: {
      fields: {
        issues: {
          keyArgs: ["orderBy", "states", "labels"],
          merge(existing, incoming) {
            if (!existing) return incoming;
            return {
              ...incoming,
              nodes: [...(existing.nodes ?? []), ...(incoming.nodes ?? [])],
            };
          },
        },
      },
    },
    Query: {
      fields: {
        search: {
          keyArgs: ["query", "type"],
          merge(existing, incoming) {
            if (!existing) return incoming;
            return {
              ...incoming,
              nodes: [...(existing.nodes ?? []), ...(incoming.nodes ?? [])],
            };
          },
        },
      },
    },
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});
