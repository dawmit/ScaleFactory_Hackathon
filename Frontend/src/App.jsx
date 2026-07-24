import { useState, useEffect } from 'react'

function App() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetching from your local Flask server!
    fetch('http://127.0.0.1:5000/api/admin/stats')
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok")
        return res.json()
      })
      .then(data => setStats(data))
      .catch(err => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          Super Markup Bros
        </h1>
        
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {!stats && !error && <p className="text-gray-500 animate-pulse">Loading stats from Flask...</p>}
        
        {stats && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-semibold uppercase">Total Users</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-semibold uppercase">Total Skills</p>
              <p className="text-3xl font-bold text-green-900">{stats.totalSkills}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App