import { db } from '../firebase/config'

const Home = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Welcome to RoomSync</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">Find your ideal roommate in Lahore.</p>
    </div>
  )
}
export default Home