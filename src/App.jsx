import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OperatorPage from './pages/OperatorPage'
import ProjectionPage from './pages/ProjectionPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <div className="text-text-muted text-sm">Loading...</div>
    </div>
  )

  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <OperatorPage />
          </ProtectedRoute>
        } />
        <Route path="/projection" element={<ProjectionPage />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
