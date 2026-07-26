import { useState, useEffect } from 'react'

function App() {
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
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [activeResources, setActiveResources] = useState({ skillName: '', items: [] });
    const [loadingResources, setLoadingResources] = useState(false);

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const [profileRes, targetsRes, timelineRes] = await Promise.all([
            fetch(`http://127.0.0.1:5000/api/users/${userId}/profile`),
            fetch(`http://127.0.0.1:5000/api/users/${userId}/targets`),
            fetch(`http://127.0.0.1:5000/api/users/${userId}/timeline`)
          ]);

          if (!profileRes.ok || !targetsRes.ok || !timelineRes.ok) throw new Error("Failed to fetch user data");

          const profileData = await profileRes.json();
          const targetsData = await targetsRes.json();
          const timelineData = await timelineRes.json();

          const enrichedTargets = targetsData.map(target => {
            const tlMatch = timelineData.find(t => t.targetId === target.id);
            return { ...target, skillName: tlMatch ? tlMatch.skillName : "Target Skill" };
          });

          setProfile(profileData);
          setTargets(enrichedTargets);
          setTimeline(timelineData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }, [userId]);

    const getNextStatus = (currentStatus) => {
      const statusFlow = {
        'Not Started': 'In Progress',
        'In Progress': 'Completed',
        'Completed': 'Not Started'
      };
      return statusFlow[currentStatus] || 'In Progress';
    };

    const handleUpdateStatus = async (targetId, newStatus) => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/targets/${targetId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (res.ok) {
          setTargets(prev => prev.map(t => t.id === targetId ? { ...t, status: newStatus } : t));
          setTimeline(prev => prev.map(t => t.targetId === targetId ? { ...t, status: newStatus } : t));
        }
      } catch (err) {
        console.error("Failed to update status", err);
      }
    };

    const handleViewResources = async (skillId, skillName) => {
      setLoadingResources(true);
      setIsResourceModalOpen(true);
      setActiveResources({ skillName, items: [] });
      
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/skills/${skillId}/resources`);
        if (res.ok) {
          const data = await res.json();
          setActiveResources({ skillName, items: data.resources });
        }
      } catch (err) {
        console.error("Failed to fetch resources", err);
      } finally {
        setLoadingResources(false);
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const formatSmartText = (text) => {
      return text.replace(/(Specific:|Measurable:|Achievable:|Relevant:|Time-bound:)/g, '\n**$1**').trim();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl text-gray-500 animate-pulse">Loading Dashboard...</p></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl text-red-500">Error: {error}</p></div>;

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                {profile?.name.charAt(0)}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Your SMART Targets</h2>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">{targets.length} Active</span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {targets.length === 0 ? (
                  <p className="text-gray-500 italic">No active targets found.</p>
                ) : (
                  targets.map((target) => (
                    <div key={target.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                          <button 
                            onClick={() => handleUpdateStatus(target.id, getNextStatus(target.status))}
                            title="Click to cycle status"
                            className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              target.status === 'Completed' ? 'bg-green-500 border-green-500 text-white' : 
                              target.status === 'In Progress' ? 'bg-blue-50 border-blue-400 text-blue-600' : 'bg-gray-50 border-gray-300'
                            }`}
                          >
                            {target.status === 'Completed' && (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            )}
                            {target.status === 'In Progress' && (
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </button>
                          {target.skillName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusColor(target.status)}`}>
                            {target.status}
                          </span>
                          {target.targetDate && (
                            <span className="text-sm text-gray-500 font-medium whitespace-nowrap border px-2 py-1 rounded-md bg-gray-50">
                              Due: {new Date(target.targetDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-gray-700 mb-6 flex-grow bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {formatSmartText(target.targetText).split('\n').map((line, idx) => (
                          <p key={idx} className="leading-relaxed">
                            {line.includes('**') ? (
                              <>
                                <strong className="text-gray-900">{line.replace(/\*\*/g, '')}</strong>
                              </>
                            ) : line}
                          </p>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                        <div className="flex-1 relative">
                          <select 
                            value={target.status}
                            onChange={(e) => handleUpdateStatus(target.id, e.target.value)}
                            className="w-full h-full bg-white border border-gray-300 text-gray-700 py-2.5 pl-4 pr-8 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleViewResources(target.skillId, target.skillName)}
                          className="flex-1 bg-blue-50 text-blue-700 border border-blue-100 py-2.5 rounded-lg font-medium hover:bg-blue-100 hover:text-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                          Find Resources
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="lg:col-span-1 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Progress Timeline</h2>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                {timeline.length === 0 ? (
                  <p className="text-gray-500 italic">No timeline events yet.</p>
                ) : (
                  <div className="space-y-6 border-l-2 border-gray-100 ml-3 pl-5 relative">
                    {timeline.map((event, index) => (
                      <div key={index} className="relative">
                        <div className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors ${
                          event.status === 'Completed' ? 'bg-green-500' : 
                          event.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                          <div className="flex flex-col mb-1">
                            <span className="text-blue-700 font-bold text-sm">{event.skillName}</span>
                            <time className="text-xs font-medium text-gray-500 mt-1">Due: {new Date(event.targetDate).toLocaleDateString()}</time>
                          </div>
                          <p className={`text-xs uppercase font-bold mt-2 tracking-wider ${
                            event.status === 'Completed' ? 'text-green-600' : 
                            event.status === 'In Progress' ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {event.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {isResourceModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">
                  Top Resources for <span className="text-blue-600">{activeResources.skillName}</span>
                </h3>
                <button 
                  onClick={() => setIsResourceModalOpen(false)}
                  className="text-gray-400 hover:text-gray-800 transition-colors bg-white hover:bg-gray-100 p-2 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto bg-white flex-grow">
                {loadingResources ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Curating tutorials and StackOverflow threads...</p>
                  </div>
                ) : activeResources.items.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-gray-500">No specific resources could be curated for this skill right now.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeResources.items.map((res, i) => (
                      <a 
                        key={i} 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-start p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group bg-gray-50 hover:bg-blue-50/30"
                      >
                        {res.thumbnail && (
                          <img src={res.thumbnail} alt="thumbnail" className="w-28 h-20 object-cover rounded-lg mr-4 flex-shrink-0 border border-gray-200 shadow-sm" />
                        )}
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-blue-500 transition-colors">
                              {res.provider} • {res.type}
                            </span>
                            {res.is_free && <span className="bg-green-100 border border-green-200 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">FREE</span>}
                          </div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 leading-snug line-clamp-2">{res.title}</h4>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- ADMIN DASHBOARD COMPONENT ---
  const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [heatmap, setHeatmap] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchAdminData = async () => {
        try {
          const [usersRes, heatmapRes] = await Promise.all([
            fetch('http://127.0.0.1:5000/api/admin/users'),
            fetch('http://127.0.0.1:5000/api/admin/heatmap')
          ]);
          setUsers(await usersRes.json());
          setHeatmap(await heatmapRes.json());
        } catch(err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAdminData();
    }, []);

    const getHeatmapColor = (status) => {
      switch(status) {
        case 'Missing': return 'bg-red-50 border-red-200 text-red-800';
        case 'Optimal': return 'bg-green-50 border-green-200 text-green-800';
        case 'Surplus': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
        default: return 'bg-gray-50 border-gray-200 text-gray-800';
      }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl text-gray-500 animate-pulse">Loading Admin Data...</p></div>;

    // Filter out the admin user from the consultant list for clarity
    const consultants = users.filter(u => u.name !== 'Academy Lead');

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1 text-lg">Academy Overview</p>
            </div>
            <button 
              onClick={() => setCurrentUser(null)}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-lg"
            >
              Sign Out
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Users List */}
            <section className="lg:col-span-1 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Consultants ({consultants.length})</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                {consultants.map(user => (
                  <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">ID: {user.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Right Column: Skills Heatmap */}
            <section className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Organization Skill Heatmap</h2>
                
                {/* Heatmap Legend */}
                <div className="flex gap-3 text-xs font-semibold bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400"></span> Missing</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400"></span> Optimal (1)</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400"></span> Surplus (2+)</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heatmap.map(skill => (
                  <div key={skill.id} className={`p-5 rounded-xl border ${getHeatmapColor(skill.status)} shadow-sm flex flex-col justify-between h-32 transition-all hover:scale-[1.02]`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">{skill.proficiency}</span>
                      <span className="text-2xl font-black opacity-90">{skill.count}</span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight line-clamp-2">{skill.skillName}</h3>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN APP ROUTING ---
  if (!currentUser) return <LoginScreen />;
  if (currentUser.redirectTarget === "/admin-dashboard") return <AdminDashboard />;
  
  return <UserDashboard userId={currentUser.id} />;
}

export default App;