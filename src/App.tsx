import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import OperatorPage from './pages/OperatorPage'
import ProjectionPage from './pages/ProjectionPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<OperatorPage />} />
        <Route path="/projection" element={<ProjectionPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
