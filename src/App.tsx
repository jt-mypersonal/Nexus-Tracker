import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { WorkItemsPage } from './pages/WorkItemsPage'
import { InvoicesPage } from './pages/InvoicesPage'
import { FormReviewPage } from './pages/FormReviewPage'
import { FormReviewDetailPage } from './pages/FormReviewDetailPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7080a0' }}>Loading...</div>
  if (!session) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function AppRoutes() {
  const { session, loading } = useAuth()
  if (loading) return null

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/items" element={<PrivateRoute><WorkItemsPage /></PrivateRoute>} />
      <Route path="/invoices" element={<PrivateRoute><InvoicesPage /></PrivateRoute>} />
      <Route path="/form-review" element={<PrivateRoute><FormReviewPage /></PrivateRoute>} />
      <Route path="/form-review/:formId" element={<PrivateRoute><FormReviewDetailPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  )
}
