import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: "https://api.github.com/graphql",
});

const authLink = new SetContextLink((prevContext, _operation) => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  return {
    ...prevContext,
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
