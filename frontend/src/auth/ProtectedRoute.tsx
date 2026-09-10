import {
  Navigate,
} from 'react-router-dom'

import type {
  ReactNode,
} from 'react'

import {
  useAuth,
} from './AuthContext'


export function ProtectedRoute({
  children,
}: {
  children: ReactNode
}) {
  const {
    user,
    loading,
  } =
    useAuth()

  /*
   * While the existing session is being restored, keep the
   * application shell mounted. AppLayout is responsible for
   * withholding protected route content until auth is resolved.
   */
  if (loading) {
    return children
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}