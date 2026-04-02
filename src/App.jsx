import { Navigate, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import MessagesPage from './pages/MessagesPage'
import CreateThreadPage from './pages/CreateThreadPage'
import ActivityPage from './pages/ActivityPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import { selectIsAuthenticated } from './features/auth/authSlice'

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function GuestRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return children
}

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="create" element={<CreateThreadPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="*"
        element={
          isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  )
}

export default App
