'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { apolloClient } from '@/lib/apollo/client'
import { ME_QUERY } from '@/graphql/auth/queries'
import { REFRESH_TOKEN_MUTATION, LOGOUT_MUTATION } from '@/graphql/auth/mutations'
import { setAccessToken, clearAccessToken } from '@/lib/auth/token'
import type { AuthUser, AuthResponse } from '@/graphql/types'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (response: AuthResponse) => void
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await apolloClient.query<{ me: AuthUser }>({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      })
      setUser(data.me ?? null)
    } catch {
      setUser(null)
    }
  }, [])

  const initialize = useCallback(async () => {
    setLoading(true)
    try {
      await fetchMe()
    } catch {
      // access token missing — try refresh
      try {
        const { data } = await apolloClient.mutate<{ refreshToken: string }>({
          mutation: REFRESH_TOKEN_MUTATION,
        })
        const newToken = data?.refreshToken
        if (newToken) {
          setAccessToken(newToken)
          await fetchMe()
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [fetchMe])

  useEffect(() => {
    void initialize()
  }, [initialize])

  const login = useCallback((response: AuthResponse) => {
    setAccessToken(response.accessToken)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apolloClient.mutate({ mutation: LOGOUT_MUTATION })
    } catch {
      // ignore errors during logout
    }
    clearAccessToken()
    setUser(null)
    apolloClient.clearStore().catch(() => undefined)
  }, [])

  const refetch = useCallback(async () => {
    await fetchMe()
  }, [fetchMe])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
