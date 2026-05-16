import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import CreateItem from './pages/CreateItem'
import ViewAll from './pages/ViewAll'
import ViewSingle from './pages/ViewSingle'
import EditItem from './pages/EditItem'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Account from './pages/Account'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/all" element={<ViewAll />} />
          <Route path="/view/:id" element={<ViewSingle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes - require login */}
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App