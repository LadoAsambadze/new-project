"use client";

import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloLink } from "@apollo/client/link";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { HttpLink } from "@apollo/client/link/http";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { Observable } from "rxjs";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/graphql";

// ─── Token Refresh ────────────────────────────────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ??
      "http://localhost:4000";
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { accessToken?: string };
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

// ─── Auth Link ────────────────────────────────────────────────────────────────
// Attaches the access token from localStorage to every request header.
// SetContextLink takes (prevContext, operation) in Apollo 4.
const authLink = new SetContextLink((prevContext) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const existingHeaders =
    (prevContext as Record<string, unknown>)["headers"] ?? {};

  return {
    ...prevContext,
    headers: {
      ...(existingHeaders as Record<string, string>),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// ─── Error Link ───────────────────────────────────────────────────────────────
// Intercepts UNAUTHENTICATED errors, calls /auth/refresh, stores new token, retries.
const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error)) return;

  const is401 = error.errors.some(
    (err) =>
      err.extensions?.["code"] === "UNAUTHENTICATED" ||
      (err.extensions?.["response"] as { statusCode?: number } | undefined)
        ?.statusCode === 401
  );

  if (!is401) return;

  return new Observable<ApolloLink.Result>((observer) => {
    refreshAccessToken()
      .then((newToken) => {
        if (!newToken) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
          }
          observer.error(new Error("Session expired. Please log in again."));
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newToken);
        }

        // Update context headers with new token and retry the operation.
        operation.setContext((ctx: Record<string, unknown>) => ({
          ...ctx,
          headers: {
            ...((ctx["headers"] as Record<string, string>) ?? {}),
            authorization: `Bearer ${newToken}`,
          },
        }));

        forward(operation).subscribe({
          next: (value) => observer.next(value),
          error: (err: unknown) => observer.error(err),
          complete: () => observer.complete(),
        });
      })
      .catch((err: unknown) => observer.error(err));
  });
});

// ─── HTTP Link ────────────────────────────────────────────────────────────────
const httpLink = new HttpLink({
  uri: API_URL,
  credentials: "include",
});

// ─── Apollo Client ────────────────────────────────────────────────────────────
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
