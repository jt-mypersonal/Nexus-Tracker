import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getForm, type FormField, type RequiredLevel } from '../lib/formReviewData'

type Result = 'pass' | 'fail' | 'na' | ''

interface FieldResult { r: Result; n: string }
type Results = Record<string, FieldResult>  // key = "s{stepIdx}_f{fieldIdx}"

function fieldKey(si: number, fi: number) { return `s${si}_f${fi}` }

// ── Type badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const color =
    type === 'Calculated' ? { bg: '#78350f', fg: '#fcd34d' } :
    type === 'Signature'  ? { bg: '#1e1b4b', fg: '#a5b4fc' } :
    type === 'Photo'      ? { bg: '#1c1917', fg: '#fed7aa' } :
    type === 'Drawing'    ? { bg: '#0c1a2e', fg: '#93c5fd' } :
    type.includes('Picker') ? { bg: '#064e3b', fg: '#6ee7b7' } :
    type === 'Multi-select'  ? { bg: '#052e16', fg: '#86efac' } :
    type === 'Toggle'     ? { bg: '#431407', fg: '#fdba74' } :
    type === 'Date'       ? { bg: '#0a2540', fg: '#67e8f9' } :
    type.includes('Decimal') || type.includes('Integer') ? { bg: '#2e1065', fg: '#c4b5fd' } :
    { bg: '#1e293b', fg: '#94a3b8' }
  return (
    <span style={{ background: color.bg, color: color.fg, fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 8, whiteSpace: 'nowrap' }}>
      {type}
    </span>
  )
}

// ── Required badge ────────────────────────────────────────────────────────────
function ReqBadge({ req }: { req: RequiredLevel }) {
  if (req === 'YES')  return <span style={{ background: '#450a0a', color: '#fca5a5', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 8 }}>Required</span>
  if (req === 'COND') return <span style={{ background: '#431407', color: '#fdba74', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 8 }}>Conditional</span>
  return <span style={{ background: '#1e293b', color: '#cbd5e1', fontSize: 10, padding: '1px 7px', borderRadius: 8 }}>Optional</span>
}

// ── Result buttons ────────────────────────────────────────────────────────────
function ResultButtons({
  value, onChange, disabled,
}: { value: Result; onChange: (v: Result) => void; disabled: boolean }) {
  const opts: { v: Result; label: string; active: string; text: string }[] = [
    { v: 'pass', label: 'Pass', active: '#166534', text: '#86efac' },
    { v: 'fail', label: 'Fail', active: '#7f1d1d', text: '#fca5a5' },
    { v: 'na',   label: 'N/A',  active: '#1e3a5f', text: '#93c5fd' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {opts.map(o => (
        <button
          key={o.v}
          disabled={disabled}
          onClick={() => onChange(value === o.v ? '' : o.v)}
          style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: 'none',
            cursor: disabled ? 'default' : 'pointer',
            background: value === o.v ? o.active : '#1e293b',
            color: value === o.v ? o.text : '#d1d5db',
            opacity: disabled ? 0.7 : 1,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function FormReviewDetailPage() {
  const { formId }     = useParams<{ formId: string }>()
  const [sp]           = useSearchParams()
  const reviewId       = sp.get('reviewId')
  const navigate       = useNavigate()
  const { user }       = useAuth()

  const form = getForm(formId ?? '')

  const [reviewerName, setReviewerName] = useState('')
  const [results, setResults]           = useState<Results>({})
  const [notes, setNotes]               = useState<Record<string, string>>({})
  const [openNote, setOpenNote]         = useState<string | null>(null)
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [readOnly, setReadOnly]         = useState(false)
  const [savedAt, setSavedAt]           = useState<string | null>(null)
  const [savedBy, setSavedBy]           = useState<string | null>(null)

  // Name default from email prefix
  useEffect(() => {
    if (user?.email && !reviewerName) {
      const prefix = user.email.split('@')[0]
      setReviewerName(prefix.charAt(0).toUpperCase() + prefix.slice(1))
    }
  }, [user])

  // Load existing review if reviewId provided
  useEffect(() => {
    if (!reviewId) return
    supabase.from('form_reviews').select('*').eq('id', reviewId).single()
      .then(({ data }) => {
        if (!data) return
        setReviewerName(data.reviewer_name ?? '')
        setResults(data.results ?? {})
        setNotes(data.notes_map ?? {})
        setSaved(true)
        setReadOnly(true)
        setSavedAt(data.created_at)
        setSavedBy(data.reviewer_name || data.reviewer_email)
      })
  }, [reviewId])

  if (!form) return (
    <div style={{ color: '#fca5a5', padding: 32 }}>Form not found.</div>
  )

  function setResult(key: string, r: Result) {
    setResults(prev => ({ ...prev, [key]: { r, n: prev[key]?.n ?? '' } }))
  }
  function setNote(key: string, n: string) {
    setNotes(prev => ({ ...prev, [key]: n }))
  }

  // Totals
  let passCount = 0, failCount = 0, naCount = 0, totalFields = 0
  form.steps.forEach((step, si) => {
    step.fields.forEach((_, fi) => {
      totalFields++
      const r = results[fieldKey(si, fi)]?.r ?? ''
      if (r === 'pass') passCount++
      else if (r === 'fail') failCount++
      else if (r === 'na') naCount++
    })
  })
  const answered = passCount + failCount + naCount
  const pct = totalFields ? Math.round((answered / totalFields) * 100) : 0

  async function handleSave() {
    if (!reviewerName.trim()) { alert('Enter your name before saving.'); return }
    setSaving(true)
    const payload = {
      form_type:      form!.id,
      form_label:     form!.label,
      reviewer_email: user?.email ?? '',
      reviewer_name:  reviewerName.trim(),
      results,
      notes_map:      notes,
      pass_count:     passCount,
      fail_count:     failCount,
      total_count:    totalFields,
      updated_at:     new Date().toISOString(),
    }
    const { error } = reviewId && saved
      ? await supabase.from('form_reviews').update(payload).eq('id', reviewId)
      : await supabase.from('form_reviews').insert(payload)

    setSaving(false)
    if (error) { alert('Save failed: ' + error.message); return }
    setSaved(true)
    alert('Review saved successfully.')
    navigate('/form-review')
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/form-review')}
          style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18 }}>{form.label}</div>
          {readOnly && savedAt && (
            <div style={{ color: '#7080a0', fontSize: 12 }}>
              Saved by {savedBy} · {new Date(savedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Reviewer name */}
        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#7080a0', fontSize: 12 }}>Reviewer:</span>
            <input
              value={reviewerName}
              onChange={e => setReviewerName(e.target.value)}
              placeholder="Your name"
              style={{
                background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
                color: '#e2e8f0', fontSize: 13, padding: '5px 10px', width: 160,
              }}
            />
          </div>
        )}

        {/* Progress */}
        <div style={{ background: '#111827', borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
          <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700 }}>{pct}%</div>
          <div style={{ color: '#4a5568', fontSize: 10 }}>{answered} / {totalFields} answered</div>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
          <span style={{ color: '#86efac', fontWeight: 700 }}>{passCount} Pass</span>
          <span style={{ color: '#fca5a5', fontWeight: 700 }}>{failCount} Fail</span>
          <span style={{ color: '#93c5fd', fontWeight: 700 }}>{naCount} N/A</span>
        </div>

        {!readOnly && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6,
              padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : saved ? 'Update' : 'Save Review'}
          </button>
        )}
        {readOnly && (
          <button
            onClick={() => setReadOnly(false)}
            style={{ background: '#374151', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
          >
            Edit
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#1e293b', borderRadius: 4, height: 4, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#3472c8', transition: 'width 0.3s' }} />
      </div>

      {/* Steps */}
      {form.steps.map((step, si) => (
        <div key={si} style={{ marginBottom: 32 }}>

          {/* Step header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              background: '#3472c8', color: '#fff', fontSize: 10, fontWeight: 700,
              padding: '2px 9px', borderRadius: 12, whiteSpace: 'nowrap',
            }}>
              STEP {si + 1}{step.isRepeating ? ' (repeating)' : ''}
            </span>
            <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: 15 }}>{step.title}</span>
          </div>

          {step.blockCondition && (
            <div style={{ background: '#450a0a', borderLeft: '3px solid #dc2626', color: '#fca5a5', fontSize: 12, padding: '6px 10px', borderRadius: '0 4px 4px 0', marginBottom: 6 }}>
              <strong>Blocks:</strong> {step.blockCondition}
            </div>
          )}
          {step.stepNote && (
            <div style={{ background: '#1c1f2e', borderLeft: '3px solid #334155', color: '#94a3b8', fontSize: 12, padding: '6px 10px', borderRadius: '0 4px 4px 0', marginBottom: 6 }}>
              {step.stepNote}
            </div>
          )}

          {/* Field table */}
          <div style={{ background: '#111827', borderRadius: 8, overflow: 'hidden', border: '1px solid #1e293b' }}>
            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 120px 90px 200px 110px 1fr',
              gap: 0,
              background: '#0d1117',
              borderBottom: '1px solid #253358',
              padding: '7px 12px',
            }}>
              {['Field', 'Type', 'Required', 'Synced From Portal', 'Result', 'Notes'].map(h => (
                <div key={h} style={{ color: '#7b92b2', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
              ))}
            </div>

            {step.fields.map((field, fi) => {
              const k   = fieldKey(si, fi)
              const res = results[k]?.r ?? ''
              const nt  = notes[k] ?? ''
              const isOpen = openNote === k
              const baseRow = fi % 2 === 0 ? '#111827' : '#0d1117'
              const rowBg = res === 'pass' ? '#071a0d' : res === 'fail' ? '#1a0808' : res === 'na' ? '#080e1a' : baseRow

              return (
                <div key={fi} style={{ borderBottom: '1px solid #1e2a3a', background: rowBg }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 120px 90px 200px 110px 1fr',
                    gap: 0,
                    padding: '8px 12px',
                    alignItems: 'start',
                  }}>
                    {/* Field label */}
                    <div>
                      <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{field.label}</div>
                      {field.note && (
                        <div style={{ color: '#64748b', fontSize: 11, marginTop: 3, lineHeight: 1.4 }}>{field.note}</div>
                      )}
                    </div>

                    {/* Type */}
                    <div style={{ paddingTop: 2 }}>
                      <TypeBadge type={field.type} />
                    </div>

                    {/* Required */}
                    <div style={{ paddingTop: 2 }}>
                      <ReqBadge req={field.required} />
                    </div>

                    {/* Sync source */}
                    <div style={{ paddingTop: 2 }}>
                      {field.sync ? (
                        <span style={{ color: '#93c5fd', fontSize: 11, lineHeight: 1.4 }}>{field.sync}</span>
                      ) : (
                        <span style={{ color: '#374151', fontSize: 11 }}>—</span>
                      )}
                    </div>

                    {/* Result buttons */}
                    <div style={{ paddingTop: 2 }}>
                      <ResultButtons value={res} onChange={v => setResult(k, v)} disabled={readOnly} />
                    </div>

                    {/* Notes — always visible textarea in edit mode */}
                    <div style={{ paddingTop: 2 }}>
                      {readOnly ? (
                        nt
                          ? <span style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>{nt}</span>
                          : <span style={{ color: '#374151', fontSize: 11 }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                          {isOpen ? (
                            <textarea
                              autoFocus
                              value={nt}
                              onChange={e => setNote(k, e.target.value)}
                              onBlur={() => setOpenNote(null)}
                              rows={4}
                              style={{
                                background: '#1e293b', border: '1px solid #3b5275', borderRadius: 6,
                                color: '#e2e8f0', fontSize: 12, padding: '6px 8px',
                                resize: 'vertical', width: '100%', minWidth: 120, lineHeight: 1.5,
                              }}
                              placeholder="Add a note…"
                            />
                          ) : (
                            <button
                              onClick={() => setOpenNote(k)}
                              style={{
                                background: 'none', border: '1px solid #253358', borderRadius: 6,
                                color: nt ? '#93c5fd' : '#94a3b8', fontSize: 11, cursor: 'pointer',
                                padding: '3px 10px', lineHeight: 1.5,
                              }}
                            >
                              {nt ? '📝 ' + nt.slice(0, 30) + (nt.length > 30 ? '…' : '') : '+ Note'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Bottom save */}
      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, paddingBottom: 40 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8,
              padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : saved ? 'Update Review' : 'Save Review'}
          </button>
        </div>
      )}
    </div>
  )
}
