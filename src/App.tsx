import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import LandingPage from '@/pages/LandingPage'
import AdminLayout from '@/components/AdminLayout'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminOrganizations from '@/pages/admin/Organizations'
import AdminSessions from '@/pages/admin/Sessions'
import ClientLayout from '@/components/ClientLayout'
import ClientDashboard from '@/pages/portal/Dashboard'
import SessionDetail from '@/pages/portal/SessionDetail'
import { Loader2 } from 'lucide-react'

const queryClient = new QueryClient()

// Protected Route Wrapper
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/portal" replace />
  }

  return <>{children}</>
}

// Redirect Logic
function RootRedirect() {
  const { user, profile, loading } = useAuth()

  if (loading) return null

  if (!user) return <LandingPage />

  if (profile?.role === 'admin') return <Navigate to="/admin" replace />

  return <Navigate to="/portal" replace />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LandingPage />} />

            <Route path="/" element={<RootRedirect />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/organizations" element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminOrganizations />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/sessions" element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminSessions />
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* Client Routes */}
            <Route path="/portal" element={
              <ProtectedRoute>
                <ClientLayout>
                  <ClientDashboard />
                </ClientLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/session/:id" element={
              <ProtectedRoute>
                <ClientLayout>
                  <SessionDetail />
                </ClientLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
