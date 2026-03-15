import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import { LanguageProvider } from './context/LanguageContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import FindServices from './pages/FindServices'
import Services from './pages/Services'
import CategoryPage from './pages/CategoryPage'
import ProviderProfile from './pages/ProviderProfile'
import BookingFlow from './pages/BookingFlow'
import FindNearby from './pages/FindNearby'
import AdminDashboard from './pages/AdminDashboard'
import CustomerDashboard from './pages/Dashboard/CustomerDashboard'
import ProviderDashboard from './pages/Dashboard/ProviderDashboard'

// Components
import Navbar from './components/Navbar'
import Loading from './components/Loading'

// Require Auth Component
const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Login Required
          </h2>
          <p className="text-gray-500 mb-6">
            Please login to access this page
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to={`/login?redirect=${location.pathname}`}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl 
                         font-semibold hover:bg-purple-600/90 transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 border border-purple-300 text-purple-600 
                         rounded-xl font-semibold hover:bg-purple-300/20 transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    )
  }
  return children
}

// Protected Route Component
function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return <Loading />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppContent() {
  const { loading } = useAuth()

  if (loading) return <Loading />

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--c-bg)' }}>
      <Navbar />
      
      <main className="relative">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/find-services" element={
            <RequireAuth><FindServices /></RequireAuth>
          } />
          <Route path="/services" element={
            <RequireAuth><Services /></RequireAuth>
          } />
          <Route path="/services/:categoryId" element={
            <RequireAuth><CategoryPage /></RequireAuth>
          } />
          <Route path="/provider/:id" element={<ProviderProfile />} />
          <Route path="/booking-flow" element={
            <RequireAuth><BookingFlow /></RequireAuth>
          } />

          {/* Customer Routes */}
          <Route 
            path="/find-nearby" 
            element={
              <RequireAuth><FindNearby /></RequireAuth>
            } 
          />
          <Route 
            path="/booking" 
            element={
              <ProtectedRoute role="customer">
                <BookingFlow />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/customer" 
            element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Provider Routes */}
          <Route 
            path="/dashboard/provider" 
            element={
              <ProtectedRoute role="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <AuthProvider>
          <BookingProvider>
            <AppContent />
          </BookingProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  )
}

export default App
