import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { FORMS } from '../lib/formReviewData'

interface SavedReview {
  id: string
  form_type: string
  reviewer_name: string
  reviewer_email: string
  pass_count: number
  fail_count: number
  total_count: number
  created_at: string
}

const FORM_COLORS: Record<string, string> = {
  daily:      '#0ea5e9',
  tlreport:   '#10b981',
  negative:   '#f59e0b',
  rectifier:  '#8b5cf6',
  groundbed:  '#ef4444',
  drawing:    '#ec4899',
}

export function FormReviewPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [reviews, setReviews] = useState<SavedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('form_reviews')
      .select('id,form_type,reviewer_name,reviewer_email,pass_count,fail_count,total_count,created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data ?? []) as SavedReview[])
        setLoading(false)
      })
  }, [])

  function reviewsFor(formId: string) {
    return reviews.filter(r => r.form_type === formId)
  }

  function passRate(r: SavedReview) {
    if (!r.total_count) return null
    return Math.round((r.pass_count / r.total_count) * 100)
  }

  function startReview(formId: string) {
    setStarting(formId)
    navigate(`/form-review/${formId}`)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700 }}>Mobile Form Review</h1>
        <p style={{ color: '#7080a0', fontSize: 13, marginTop: 4 }}>
          Select a form to begin a UAT review session. Results are saved to this tracker and accessible to the project team.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {FORMS.map(form => {
          const color      = FORM_COLORS[form.id] ?? '#3472c8'
          const totalSteps = form.steps.length
          const totalFields = form.steps.reduce((n, s) => n + s.fields.length, 0)
          const prior      = reviewsFor(form.id)

          return (
            <div
              key={form.id}
              style={{
                background: '#1a2744',
                border: '1px solid #253358',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {/* Color bar */}
              <div style={{ height: 4, background: color }} />

              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>{form.label}</div>
                    <div style={{ color: '#7080a0', fontSize: 12, marginTop: 2 }}>
                      {totalSteps} steps · {totalFields} fields
                    </div>
                  </div>
                  <button
                    onClick={() => startReview(form.id)}
                    disabled={starting === form.id}
                    style={{
                      background: color,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '7px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: starting === form.id ? 0.6 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {starting === form.id ? 'Opening…' : '▶ Start Review'}
                  </button>
                </div>

                {/* Prior reviews */}
                {loading ? (
                  <div style={{ color: '#4a5568', fontSize: 12 }}>Loading prior reviews…</div>
                ) : prior.length === 0 ? (
                  <div style={{ color: '#3a4e70', fontSize: 12, fontStyle: 'italic' }}>No reviews yet</div>
                ) : (
                  <div>
                    <div style={{ color: '#7080a0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      Prior Reviews
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {prior.slice(0, 5).map(r => {
                        const rate = passRate(r)
                        return (
                          <div
                            key={r.id}
                            onClick={() => navigate(`/form-review/${r.form_type}?reviewId=${r.id}`)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              background: '#111827', borderRadius: 6, padding: '6px 10px',
                              cursor: 'pointer', gap: 8,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.reviewer_name || r.reviewer_email}
                              </div>
                              <div style={{ color: '#4a5568', fontSize: 11 }}>
                                {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                            {rate !== null && (
                              <div style={{
                                background: rate >= 90 ? '#064e3b' : rate >= 70 ? '#78350f' : '#450a0a',
                                color: rate >= 90 ? '#6ee7b7' : rate >= 70 ? '#fcd34d' : '#fca5a5',
                                fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap',
                              }}>
                                {r.pass_count}P · {r.fail_count}F · {rate}%
                              </div>
                            )}
                            <div style={{ color: '#3472c8', fontSize: 11 }}>View →</div>
                          </div>
                        )
                      })}
                      {prior.length > 5 && (
                        <div style={{ color: '#4a5568', fontSize: 11, textAlign: 'center' }}>
                          +{prior.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
