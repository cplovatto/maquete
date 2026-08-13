import type { ReactNode } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LojasProvider } from './context/LojasContext'
import { LabelsProvider } from './context/LabelsContext'
import { DataProvider } from './context/DataContext'
import { VdDataProvider } from './context/VdDataContext'
import { CompaniesProvider } from './context/CompaniesContext'
import { UsersProvider } from './context/UsersContext'
import { BillingProvider } from './context/BillingContext'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import ChannelSelect from './pages/ChannelSelect'
import AppShell from './pages/AppShell'
import VendaDiretaShell from './pages/VendaDiretaShell'
import AdminShell from './pages/AdminShell'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/entrar" replace />
  if (user.perfil === 'admin') return <Navigate to="/admin" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/entrar" replace />
  if (user.perfil !== 'admin') return <Navigate to="/app" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CompaniesProvider>
        <UsersProvider>
        <BillingProvider>
        <LojasProvider>
        <LabelsProvider>
        <DataProvider>
        <VdDataProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/entrar" element={<SignIn />} />
            <Route
              path="/selecionar-canal"
              element={
                <ProtectedRoute>
                  <ChannelSelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vd/*"
              element={
                <ProtectedRoute>
                  <VendaDiretaShell />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminShell />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
        </VdDataProvider>
        </DataProvider>
        </LabelsProvider>
        </LojasProvider>
        </BillingProvider>
        </UsersProvider>
        </CompaniesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
