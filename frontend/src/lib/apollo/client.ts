'use client'

import { ApolloClient, ApolloLink, InMemoryCache, Observable } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { HttpLink } from '@apollo/client/link/http'
import { getAccessToken, setAccessToken, clearAccessToken } from '@/lib/auth/token'
import { REFRESH_TOKEN_MUTATION } from '@/graphql/auth/mutations'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/graphql'

// ─── Auth Link ─────────────────────────────────────────────────────────────────
// Attaches the in-memory access token to every request header.
const authLink = setContext((_, prevContext: Record<string, unknown>) => {
  const token = getAccessToken()
  const existingHeaders =
    (prevContext['headers'] as Record<string, string> | undefined) ?? {}

  return {
    headers: {
      ...existingHeaders,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

// ─── Error Link ────────────────────────────────────────────────────────────────
// Intercepts UNAUTHENTICATED errors, calls refreshToken mutation, retries.
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (!graphQLErrors) return

  const isUnauthenticated = graphQLErrors.some(
    (err) =>
      err.extensions?.['code'] === 'UNAUTHENTICATED' ||
      (err.extensions?.['response'] as { statusCode?: number } | undefined)
        ?.statusCode === 401,
  )

  if (!isUnauthenticated) return

  return new Observable((observer) => {
    apolloClient
      .mutate<{ refreshToken: string }>({ mutation: REFRESH_TOKEN_MUTATION })
      .then(({ data }) => {
        const newToken = data?.refreshToken
        if (!newToken) {
          clearAccessToken()
          observer.error(new Error('Session expired. Please log in again.'))
          return
        }

        setAccessToken(newToken)

        operation.setContext((ctx: Record<string, unknown>) => ({
          ...ctx,
          headers: {
            ...((ctx['headers'] as Record<string, string>) ?? {}),
            authorization: `Bearer ${newToken}`,
          },
        }))

        forward(operation).subscribe({
          next: (value) => observer.next(value),
          error: (err: unknown) => observer.error(err),
          complete: () => observer.complete(),
        })
      })
      .catch((err: unknown) => {
        clearAccessToken()
        observer.error(err)
      })
  })
})

// ─── HTTP Link ─────────────────────────────────────────────────────────────────
const httpLink = new HttpLink({
  uri: API_URL,
  credentials: 'include',
})

// ─── Apollo Client ─────────────────────────────────────────────────────────────
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
})
