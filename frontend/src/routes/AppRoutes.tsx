import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { CartographyPage } from '../pages/CartographyPage'

export function AppRoutes() {
  return <Routes><Route element={<AppLayout />}><Route path="/cartography" element={<CartographyPage />} /><Route path="*" element={<Navigate to="/cartography" replace />} /></Route></Routes>
}
