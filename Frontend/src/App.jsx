import { useState, useEffect } from 'react'

function App() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    // 1. Fetch admin dashboard stats
    fetch('http://127.0.0.1:5000/api/admin/stats')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch stats")
        return res.json()
      })
      .then(data => setStats(data))
      .catch(err => setError(err.message))

    // 2. Fetch all users and filter out admins
    fetch('http://127.0.0.1:5000/api/admin/users')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch users")
        return res.json()
      })
      .then(data => {
        // Filter to keep only non-admin users
        const nonAdminUsers = data.filter(user => !user.isAdmin)
        setUsers(nonAdminUsers)
      })
      .catch(err => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="max-w-4xl mx-auto mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          🚀 Super Markup Bros
        </h1>
      </header>

      {error && (
        <div className="max-w-4xl mx-auto bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          Error: {error}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Non-Admin Users */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            Users
          </h2>

          {users.length === 0 && !error ? (
            <p className="text-gray-500 animate-pulse">Loading users...</p>
          ) : (
            <ul className="space-y-3">
              {users.map(user => (
                <li 
                  key={user.id} 
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <span className="font-medium text-gray-700">{user.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Role ID: {user.roleId}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT COLUMN: Dashboard Stats */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            Platform Stats
          </h2>

          {!stats && !error ? (
            <p className="text-gray-500 animate-pulse">Loading stats...</p>
          ) : (
            stats && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-semibold uppercase">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-semibold uppercase">Total Skills</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalSkills}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-semibold uppercase">Completed Targets</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.completedTargets}</p>
                </div>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  )
}

export default App