import { useState, useEffect } from 'react'

function App() {
  // State to hold the logged-in user. Null means show the login screen.
  const [currentUser, setCurrentUser] = useState(null);

  // --- LOGIN COMPONENT ---
  const LoginScreen = () => {
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://127.0.0.1:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Save the user data to state to switch views
        setCurrentUser({
          id: data.userId,
          name: name,
          isAdmin: data.isAdmin,
          redirectTarget: data.redirectTarget
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Markup Bros</h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="e.g. Alice (Java Dev)"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Hackathon Helper Note */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
            <p className="font-semibold mb-2">Seeded test users (Case-sensitive):</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><code className="bg-gray-100 px-1 rounded">Academy Lead</code> (Admin)</li>
              <li><code className="bg-gray-100 px-1 rounded">Alice (Java Dev)</code> (User)</li>
              <li><code className="bg-gray-100 px-1 rounded">Bob (Manual Tester)</code> (User)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // --- USER DASHBOARD COMPONENT ---
  const UserDashboard = ({ userId }) => {
    const [profile, setProfile] = useState(null);
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const [profileRes, targetsRes] = await Promise.all([
            fetch(`http://127.0.0.1:5000/api/users/${userId}/profile`),
            fetch(`http://127.0.0.1:5000/api/users/${userId}/targets`)
          ]);

          if (!profileRes.ok || !targetsRes.ok) throw new Error("Failed to fetch user data");

          setProfile(await profileRes.json());
          setTargets(await targetsRes.json());
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }, [userId]);

    const getStatusColor = (status) => {
      switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'In Progress': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl text-gray-500 animate-pulse">Loading Dashboard...</p></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl text-red-500">Error: {error}</p></div>;

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
              <p className="text-gray-500 mt-1 text-lg">{profile?.roleName}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentUser(null)}
                className="text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                Sign Out
              </button>
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {profile?.name.charAt(0)}
              </div>
            </div>
          </header>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your SMART Targets</h2>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">{targets.length} Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {targets.length === 0 ? (
                <p className="text-gray-500 italic col-span-2">No active targets found.</p>
              ) : (
                targets.map((target) => (
                  <div key={target.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(target.status)}`}>
                        {target.status}
                      </span>
                      {target.targetDate && (
                        <span className="text-sm text-gray-500 font-medium">
                          Due: {new Date(target.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-700 mb-6 flex-grow">
                      <p className="leading-relaxed">{target.targetText}</p>
                    </div>
                    <div className="flex gap-3 mt-auto pt-4 border-t border-gray-50">
                      <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Update Status
                      </button>
                      <button className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                        Resources
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    );
  };

  // --- ADMIN DASHBOARD PLACEHOLDER ---
  const AdminDashboard = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome, Academy Lead. The admin view goes here.</p>
      <button 
        onClick={() => setCurrentUser(null)}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Sign Out
      </button>
    </div>
  );

  // --- MAIN APP ROUTING ---
  // If no user is logged in, show the login screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  // If logged in, route based on their redirect target
  if (currentUser.redirectTarget === "/admin-dashboard") {
    return <AdminDashboard />;
  }

  return <UserDashboard userId={currentUser.id} />;
}

export default App;