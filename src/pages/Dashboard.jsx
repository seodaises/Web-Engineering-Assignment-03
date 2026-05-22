import { useAuth } from '../hooks/useAuth'
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard'

const Dashboard = () => {
  const { isAdmin } = useAuth()

  // Show admin view for admins, user view for everyone else
  return isAdmin ? <AdminDashboard /> : <UserDashboard />
}

export default Dashboard