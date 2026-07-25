import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "/api/graphql",
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
