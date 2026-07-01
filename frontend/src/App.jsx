import { Routes, Route, Navigate} from 'react-router-dom'
import { useAuth} from './context/AuthContext'

// auth pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// customer pages
import HomePage from './pages/customer/HomePage'
import CategoryPage from './pages/customer/CategoryPage'
import BusinessProfilePage from './pages/customer/BusinessProfilePage'

// user profile
import UserProfilePage from './pages/customer/UserProfilePage'

// business owner pages
import DashboardPage from './pages/business/DashboardPage'

// admin pages
import AdminPage from './pages/admin/AdminPage'

// protected route components
function ProtectedRoute({children}) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login"/>
  return children
}

function BusinessRoute({children}) {
  const { isAuthenticated, isBusinessOwner } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (!isBusinessOwner) return <Navigate to="/" />
  return children
}

function AdminRoute({children}) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (!isAdmin) return <Navigate to="/" />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* customer routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path="/business/:businessId" element={<BusinessProfilePage />} />

      {/* protected customer routes */}
      <Route path="/profile" element={
        <ProtectedRoute><UserProfilePage /></ProtectedRoute>
      } />

      {/* business owner routes */}
      <Route path="/dashboard" element={
        <BusinessRoute><DashboardPage /></BusinessRoute>
      } />

      {/* admin routes */}
      <Route path="/admin" element={
        <AdminRoute><AdminPage /></AdminRoute>
      } />

      {/* catch all route - redirect to home page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
