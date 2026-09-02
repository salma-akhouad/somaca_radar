import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import {
  clearStoredToken,
  getMe,
  getStoredToken,
  login as loginRequest,
  logoutRequest,
  onAuthExpired,
  storeToken,
} from '../api/client'
import type { CurrentUser } from '../api/types'

interface AuthContextValue {
  user: CurrentUser | null
  loading: boolean
  isAdmin: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  )

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] =
    useState<CurrentUser | null>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    return onAuthExpired(() => {
      clearStoredToken()
      setUser(null)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let active = true

    async function restore() {
      if (!getStoredToken()) {
        if (active) {
          setLoading(false)
        }

        return
      }

      try {
        const current = await getMe()

        if (active) {
          setUser(current)
        }
      } catch {
        clearStoredToken()

        if (active) {
          setUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void restore()

    return () => {
      active = false
    }
  }, [])

  async function login(
    email: string,
    password: string,
  ) {
    const response = await loginRequest(
      email,
      password,
    )

    storeToken(response.access_token)

    try {
      const current = await getMe()
      setUser(current)
    } catch (error) {
      clearStoredToken()
      setUser(null)
      throw error
    }
  }

  async function logout() {
    try {
      if (getStoredToken()) {
        await logoutRequest()
      }
    } catch {
      // Local logout must still succeed
      // if the server is unavailable.
    } finally {
      clearStoredToken()
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin:
        user?.role === 'administrateur',
      login,
      logout,
    }),
    [user, loading],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}