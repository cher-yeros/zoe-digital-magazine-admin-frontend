import {
  ApolloClient,
  ApolloLink,
  type FetchResult,
  HttpLink,
  InMemoryCache,
  Observable,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { type GraphQLError } from "graphql";
import { store } from "@/redux/store";
import { clearCredentials, updateTokens } from "@/redux/slices/authSlice";

type ApolloErrorResponse = {
  graphQLErrors?: readonly GraphQLError[];
  networkError?: { statusCode?: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forward: (operation: any) => Observable<FetchResult>;
};

const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      access_token
      refresh_token
      expires_in
    }
  }
`;

const DEV_BASE_URL = "http://localhost:4000/graphql";
const PROD_BASE_URL = "https://gyapi.finaloopai.com/graphql";
const GRAPHQL_URL = import.meta.env.PROD ? PROD_BASE_URL : DEV_BASE_URL;

const getPreferredStorage = () => {
  if (localStorage.getItem("refresh_token")) return localStorage;
  if (sessionStorage.getItem("refresh_token")) return sessionStorage;
  return localStorage;
};

const persistTokens = (accessToken: string, refreshToken?: string) => {
  const targetStorage = getPreferredStorage();
  targetStorage.setItem("access_token", accessToken);
  if (refreshToken) {
    targetStorage.setItem("refresh_token", refreshToken);
  }
};

const getRefreshToken = () => {
  const state = store.getState();
  return (
    state.auth?.refreshToken ||
    localStorage.getItem("refresh_token") ||
    sessionStorage.getItem("refresh_token")
  );
};

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const queuePendingRequest = (callback: (token: string | null) => void) => {
  pendingRequests.push(callback);
};

const resolvePendingRequests = (token: string | null) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const refresh_token = getRefreshToken();

  if (!refresh_token) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: REFRESH_TOKEN_MUTATION,
      variables: {
        input: { refresh_token },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const json = await response.json();

  if (json.errors || !json.data?.refreshToken) {
    throw new Error(json.errors?.[0]?.message || "Refresh token error");
  }

  const { access_token, refresh_token: newRefreshToken } =
    json.data.refreshToken;

  store.dispatch(
    updateTokens({
      accessToken: access_token,
      refreshToken: newRefreshToken,
    })
  );
  persistTokens(access_token, newRefreshToken);

  return access_token;
};

// Error Link to handle automatic token refresh
const errorLink = onError(
  ({
    graphQLErrors,
    networkError,
    operation,
    forward,
  }: ApolloErrorResponse) => {
    const unauthorized =
      graphQLErrors?.some(
        (err: GraphQLError) =>
          err.extensions?.code === "UNAUTHENTICATED" ||
          err.extensions?.code === "UNAUTHORIZED"
      ) ||
      (networkError as { statusCode?: number } | undefined)?.statusCode === 401;

    if (!unauthorized) {
      return;
    }

    if (!getRefreshToken()) {
      store.dispatch(clearCredentials());
      return;
    }

    const oldHeaders = operation.getContext().headers || {};

    const forwardRequest = (token: string | null) => {
      if (!token) {
        return forward(operation);
      }

      operation.setContext({
        headers: {
          ...oldHeaders,
          authorization: `Bearer ${token}`,
        },
      });
      return forward(operation);
    };

    if (isRefreshing) {
      return new Observable((observer) => {
        queuePendingRequest((token) => {
          const subscriber = forwardRequest(token)?.subscribe({
            next: (value: FetchResult) => observer.next?.(value),
            error: (err: unknown) => observer.error?.(err),
            complete: () => observer.complete?.(),
          });
          return () => subscriber?.unsubscribe();
        });
      });
    }

    isRefreshing = true;

    return new Observable((observer) => {
      refreshAccessToken()
        .then((newToken) => {
          resolvePendingRequests(newToken);
          const subscriber = forwardRequest(newToken)?.subscribe({
            next: (value: FetchResult) => observer.next?.(value),
            error: (err: unknown) => observer.error?.(err),
            complete: () => observer.complete?.(),
          });
          return () => subscriber?.unsubscribe();
        })
        .catch((err: unknown) => {
          resolvePendingRequests(null);
          store.dispatch(clearCredentials());
          observer.error?.(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }
);

// HTTP Link
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
});

// Auth Link
const authLink = setContext((_, { headers }) => {
  const state = store.getState();
  const token = state.auth?.accessToken;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Create Apollo Client
const client = new ApolloClient({
  link: from([errorLink as ApolloLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          members: {
            keyArgs: ["filter"],
            merge(existing, incoming, { args }) {
              const { pagination } = args || {};
              const page = pagination?.page || 1;

              if (page === 1) {
                return incoming;
              }

              return {
                ...incoming,
                members: [...(existing?.members || []), ...incoming.members],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});

export default client;
