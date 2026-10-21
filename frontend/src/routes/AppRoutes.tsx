import {
  lazy,
  Suspense,
} from 'react'

import type {
  ReactNode,
} from 'react'

import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import {
  ProtectedRoute,
} from '../auth/ProtectedRoute'

import {
  AppLayout,
} from '../components/layout/AppLayout'

import {
  LoginPage,
} from '../pages/LoginPage'

import {
  loadAdministrationPage,
  loadCartographyPage,
  loadIncidentsPage,
  loadSupervisionPage,
} from './pageLoaders'


const CartographyPage =
  lazy(async () => ({
    default:
      (
        await loadCartographyPage()
      ).CartographyPage,
  }))

const IncidentsPage =
  lazy(async () => ({
    default:
      (
        await loadIncidentsPage()
      ).IncidentsPage,
  }))

const SupervisionPage =
  lazy(async () => ({
    default:
      (
        await loadSupervisionPage()
      ).SupervisionPage,
  }))

const AdministrationPage =
  lazy(async () => ({
    default:
      (
        await loadAdministrationPage()
      ).AdministrationPage,
  }))


interface RouteLoadingProps {
  label: string
}


function RouteLoading({
  label,
}: RouteLoadingProps) {
  return (
    <div
      className="route-loading"
      role="status"
      aria-live="polite"
    >
      <div
        className="app-loading__mark"
        aria-hidden="true"
      />

      <span>
        {label}
      </span>
    </div>
  )
}


function lazyElement(
  element: ReactNode,
  loadingLabel:
    string,
) {
  return (
    <Suspense
      fallback={
        <RouteLoading
          label={
            loadingLabel
          }
        />
      }
    >
      {element}
    </Suspense>
  )
}


export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/cartography"
          element={
            lazyElement(
              <CartographyPage />,
              'CHARGEMENT DE LA CARTOGRAPHIE',
            )
          }
        />

        <Route
          path="/incidents"
          element={
            lazyElement(
              <IncidentsPage />,
              'CHARGEMENT DES INCIDENTS',
            )
          }
        />

        <Route
          path="/supervision"
          element={
            lazyElement(
              <SupervisionPage />,
              'CHARGEMENT DE L’ÉTAT DE L’USINE',
            )
          }
        />

        <Route
          path="/administration"
          element={
            lazyElement(
              <AdministrationPage />,
              'CHARGEMENT DE L’ADMINISTRATION',
            )
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/cartography"
            replace
          />
        }
      />
    </Routes>
  )
}