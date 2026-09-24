import { Box, CircularProgress } from '@mui/material'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { FeedbackProvider } from '../components/FeedbackProvider'
import { OfflineBanner } from '../components/OfflineBanner'
import { isFirebaseConfigured } from '../firebase/client'
import { AuthProvider, useAuth } from '../features/auth/AuthContext'
import { InventoryProvider } from '../features/inventory/InventoryContext'
import { BoxDetailPage } from '../pages/BoxDetailPage'
import { BoxesPage } from '../pages/BoxesPage'
import { DashboardPage } from '../pages/DashboardPage'
import { HistoryPage } from '../pages/HistoryPage'
import { InUsePage } from '../pages/InUsePage'
import { LoginPage } from '../pages/LoginPage'
import { MaterialDetailPage } from '../pages/MaterialDetailPage'
import { MaterialsPage } from '../pages/MaterialsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SetupPage } from '../pages/SetupPage'

function ProtectedRoutes() {
  const { user, loading } = useAuth(); const location = useLocation()
  if (loading) return <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center' }}><CircularProgress /></Box>
  if (!user) {
    const destination = `${location.pathname}${location.search}`
    sessionStorage.setItem('authDestination', destination)
    return <Navigate to="/login" replace state={{ from: destination }} />
  }
  return <InventoryProvider><OfflineBanner /><Routes><Route element={<AppShell />}><Route index element={<DashboardPage />} /><Route path="materials" element={<MaterialsPage />} /><Route path="material/:id" element={<MaterialDetailPage />} /><Route path="boxes" element={<BoxesPage />} /><Route path="box/:id" element={<BoxDetailPage />} /><Route path="in-use" element={<InUsePage />} /><Route path="history" element={<HistoryPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes></InventoryProvider>
}

function AppRoutes() {
  const { user } = useAuth()
  return <Routes>
    <Route path="/login" element={user ? <Navigate to={sessionStorage.getItem('authDestination') || '/'} replace /> : <LoginPage />} />
    <Route path="/*" element={<ProtectedRoutes />} />
  </Routes>
}

export function App() {
  if (!isFirebaseConfigured) return <SetupPage />
  return <HashRouter><AuthProvider><FeedbackProvider><AppRoutes /></FeedbackProvider></AuthProvider></HashRouter>
}
