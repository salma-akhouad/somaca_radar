import {
  lazy,
  Suspense,
} from 'react'
import type { ReactNode } from 'react'
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../pages/LoginPage'
import {
  loadAdministrationPage,
  loadCartographyPage,
  loadIncidentsPage,
  loadSupervisionPage,
} from './pageLoaders'

const CartographyPage = lazy(async () => ({
  default: (await loadCartographyPage()).CartographyPage,
}))

const IncidentsPage = lazy(async () => ({
  default: (await loadIncidentsPage()).IncidentsPage,
}))

const SupervisionPage = lazy(async () => ({
  default: (await loadSupervisionPage()).SupervisionPage,
}))

const AdministrationPage = lazy(async () => ({
  default: (await loadAdministrationPage()).AdministrationPage,
}))

function RouteLoading() {
  return (
    <div
      className="route-loading"
      role="status"
      aria-live="polite"
    >
      <div className="app-loading__mark" />

      <span>
        Chargement de l’interface
      </span>
    </div>
  )
}

function lazyElement(
  element: ReactNode,
) {
  return (
    <Suspense
      fallback={
        <RouteLoading />
      }
    >
      {element}
    </Suspense>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/cartography"
          element={lazyElement(<CartographyPage />)}
        />
        <Route
          path="/incidents"
          element={lazyElement(<IncidentsPage />)}
        />
        <Route
          path="/supervision"
          element={lazyElement(<SupervisionPage />)}
        />
        <Route
          path="/administration"
          element={lazyElement(<AdministrationPage />)}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/cartography" replace />}
      />
    </Routes>
  )
}
