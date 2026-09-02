import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { OperationsProvider } from './operations/OperationsContext'
import { AppRoutes } from './routes/AppRoutes'
import './styles/operational.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OperationsProvider>
          <AppRoutes />
        </OperationsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
