import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { CartographyPage } from '../pages/CartographyPage'
import { IncidentsPage } from '../pages/IncidentsPage'
import { SupervisionPage } from '../pages/SupervisionPage'
import { AdministrationPage } from '../pages/AdministrationPage'
import { LoginPage } from '../pages/LoginPage'

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
        <Route path="/cartography" element={<CartographyPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/supervision" element={<SupervisionPage />} />
        <Route path="/administration" element={<AdministrationPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/cartography" replace />}
      />
    </Routes>
  )
}
