import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header style={{ background: '#1a2744', borderBottom: '3px solid #3472c8' }} className="flex items-center gap-4 px-6 py-3">
        <div>
          <div style={{ color: '#6f9dd8', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Project Tracking
          </div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
            NexusIntegrity
          </div>
        </div>

        <nav className="flex gap-1 ml-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`
            }
            style={({ isActive }) => isActive ? { background: '#3472c8' } : {}}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/items"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`
            }
            style={({ isActive }) => isActive ? { background: '#3472c8' } : {}}
          >
            Work Items
          </NavLink>
          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`
            }
            style={({ isActive }) => isActive ? { background: '#3472c8' } : {}}
          >
            Invoices
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span style={{ color: '#8faeca', fontSize: 12 }}>{user?.email}</span>
          <button
            onClick={handleSignOut}
            style={{ color: '#8faeca', fontSize: 12, border: '1px solid #3a4e70', borderRadius: 4, padding: '3px 10px' }}
            className="hover:text-white hover:border-blue-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">{children}</main>

      <footer style={{ background: '#1a2744', color: '#4a6080', fontSize: 11, textAlign: 'center', padding: '10px 0' }}>
        NexusIntegrity Phase 2 &nbsp;|&nbsp; FinalMileOS Consulting &nbsp;|&nbsp; Confidential
      </footer>
    </div>
  )
}
