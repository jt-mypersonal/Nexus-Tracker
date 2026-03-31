import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, password)
    if (err) {
      setError(err)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>
        {/* Logo block */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-block', background: '#1a2744', borderRadius: 12, padding: '16px 28px', marginBottom: 12 }}>
            <div style={{ color: '#6f9dd8', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
              Project Tracker
            </div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
              NexusIntegrity
            </div>
          </div>
          <div style={{ color: '#7080a0', fontSize: 13 }}>Phase 2 Execution Tracker</div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 20px rgba(0,0,0,0.08)', border: '1px solid #dce2ef', padding: '28px 28px 24px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2744', marginBottom: 20 }}>Sign in</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5580', marginBottom: 5 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 14 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5580', marginBottom: 5 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 14 }}
              />
            </div>

            {error && (
              <div style={{ background: '#fdecea', color: '#900020', borderRadius: 6, padding: '8px 12px', fontSize: 13, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: '#3472c8', color: '#fff', border: 'none', borderRadius: 6, padding: '10px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#9aa5be' }}>
          FinalMileOS Consulting &nbsp;|&nbsp; Confidential
        </div>
      </div>
    </div>
  )
}
