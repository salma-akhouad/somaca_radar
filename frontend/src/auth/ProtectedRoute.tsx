import {
  Navigate,
} from 'react-router-dom'

import type {
  ReactNode,
} from 'react'

import {
  AppLoading,
} from '../components/common/AppLoading'

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


  if (loading) {
    return <AppLoading />
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