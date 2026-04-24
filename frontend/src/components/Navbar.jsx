import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/tasks', label: 'งาน', icon: '📋' },
  { to: '/categories', label: 'หมวดหมู่ & แท็ก', icon: '🏷️' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-800">
        <span className="text-2xl">✅</span>
        <span className="font-bold text-white text-base">TodoList</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <span className="text-base">{icon}</span>{label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <span>🚪</span>ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
