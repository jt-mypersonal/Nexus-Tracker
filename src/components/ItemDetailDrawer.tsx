import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { STATUS_ORDER, STATUS_LABELS } from '../lib/types'
import type { WorkItem, UatItem, ItemNote, TimeEntry, Status } from '../lib/types'
import { StatusBadge, CatBadge } from './StatusBadge'
import { generateUatItems } from '../lib/uat'
import { useAuth } from '../context/AuthContext'

interface Props {
  item: WorkItem
  onClose: () => void
  onUpdated: (item: WorkItem) => void
}

function fmtElapsed(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

function fmtDuration(mins: number | null) {
  if (mins == null) return '--'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function ItemDetailDrawer({ item, onClose, onUpdated }: Props) {
  const { user } = useAuth()
  const [uat, setUat] = useState<UatItem[]>([])
  const [notes, setNotes] = useState<ItemNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [actualHrs, setActualHrs] = useState<string>(item.actual_hrs?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'detail' | 'uat' | 'notes' | 'time'>('detail')

  // Time tracking
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [timerNote, setTimerNote] = useState('')
  const [timerLoading, setTimerLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Inline duration editing
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editHours, setEditHours] = useState('')
  const [editMins, setEditMins] = useState('')

  useEffect(() => {
    loadUat()
    loadNotes()
    loadTimeEntries()
  }, [item.id])

  // Tick the timer when there is an active entry
  useEffect(() => {
    if (activeEntry) {
      const startSecs = Math.floor((Date.now() - new Date(activeEntry.started_at).getTime()) / 1000)
      setElapsed(Math.max(0, startSecs))
      intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } else {
      setElapsed(0)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeEntry?.id])

  async function loadTimeEntries() {
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('work_item_id', item.id)
      .order('started_at', { ascending: false })
    if (data) {
      setTimeEntries(data as TimeEntry[])
      const active = (data as TimeEntry[]).find(e => e.stopped_at === null)
      setActiveEntry(active ?? null)
      if (active) setTimerNote(active.notes ?? '')
    }
  }

  async function loadUat() {
    const { data } = await supabase
      .from('uat_items')
      .select('*')
      .eq('work_item_id', item.id)
      .order('sort_order')
    if (data && data.length > 0) setUat(data as UatItem[])
    else await seedUat()
  }

  async function seedUat() {
    const descriptions = generateUatItems(item.title, item.notes)
    const rows = descriptions.map((d, i) => ({
      work_item_id: item.id,
      description: d,
      is_complete: false,
      sort_order: i,
    }))
    const { data } = await supabase.from('uat_items').insert(rows).select()
    if (data) setUat(data as UatItem[])
  }

  async function regenerateUat() {
    await supabase.from('uat_items').delete().eq('work_item_id', item.id)
    await seedUat()
  }

  async function loadNotes() {
    const { data } = await supabase
      .from('item_notes')
      .select('*')
      .eq('work_item_id', item.id)
      .order('created_at')
    if (data) setNotes(data as ItemNote[])
  }

  async function toggleUat(u: UatItem) {
    const updates = {
      is_complete: !u.is_complete,
      completed_at: !u.is_complete ? new Date().toISOString() : null,
      completed_by: !u.is_complete ? (user?.email ?? null) : null,
    }
    await supabase.from('uat_items').update(updates).eq('id', u.id)
    setUat(prev => prev.map(x => x.id === u.id ? { ...x, ...updates } : x))
  }

  async function addNote() {
    if (!newNote.trim()) return
    const row = { work_item_id: item.id, content: newNote.trim(), author_email: user?.email ?? null }
    const { data } = await supabase.from('item_notes').insert(row).select().single()
    if (data) {
      setNotes(prev => [...prev, data as ItemNote])
      setNewNote('')
    }
  }

  async function changeStatus(newStatus: Status) {
    setSaving(true)
    await supabase.from('status_history').insert({
      work_item_id: item.id,
      from_status: item.status,
      to_status: newStatus,
      changed_by: user?.email ?? null,
    })
    const { data } = await supabase
      .from('work_items')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .select()
      .single()
    if (data) onUpdated(data as WorkItem)
    setSaving(false)
  }

  async function saveActualHrs() {
    const hrs = parseFloat(actualHrs)
    if (isNaN(hrs)) return
    const { data } = await supabase
      .from('work_items')
      .update({ actual_hrs: hrs, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .select()
      .single()
    if (data) onUpdated(data as WorkItem)
  }

  async function startTimer() {
    setTimerLoading(true)
    const { data } = await supabase
      .from('time_entries')
      .insert({ work_item_id: item.id, logged_by: user?.email ?? null, notes: '' })
      .select()
      .single()
    if (data) {
      setActiveEntry(data as TimeEntry)
      setTimeEntries(prev => [data as TimeEntry, ...prev])
      setTimerNote('')
    }
    setTimerLoading(false)
  }

  async function stopTimer() {
    if (!activeEntry) return
    setTimerLoading(true)
    const stoppedAt = new Date().toISOString()
    const durationMinutes = Math.max(1, Math.round(elapsed / 60))
    await supabase.from('time_entries').update({
      stopped_at: stoppedAt,
      duration_minutes: durationMinutes,
      notes: timerNote.trim() || null,
    }).eq('id', activeEntry.id)
    setTimeEntries(prev => prev.map(e =>
      e.id === activeEntry.id
        ? { ...e, stopped_at: stoppedAt, duration_minutes: durationMinutes, notes: timerNote.trim() || null }
        : e
    ))
    setActiveEntry(null)
    setTimerNote('')
    setTimerLoading(false)
  }

  function startEditDuration(e: TimeEntry) {
    const h = Math.floor((e.duration_minutes ?? 0) / 60)
    const m = (e.duration_minutes ?? 0) % 60
    setEditHours(h > 0 ? String(h) : '')
    setEditMins(String(m))
    setEditingEntryId(e.id)
  }

  async function saveDuration(entryId: string) {
    const h = parseInt(editHours || '0', 10)
    const m = parseInt(editMins || '0', 10)
    const total = h * 60 + m
    if (isNaN(total) || total < 1) { setEditingEntryId(null); return }
    await supabase.from('time_entries').update({ duration_minutes: total }).eq('id', entryId)
    setTimeEntries(prev => prev.map(e => e.id === entryId ? { ...e, duration_minutes: total } : e))
    setEditingEntryId(null)
  }

  const totalMinutes = timeEntries
    .filter(e => e.stopped_at !== null)
    .reduce((s, e) => s + (e.duration_minutes ?? 0), 0)

  const isOwner = user?.email === 'josh@finalmileos.com'

  const fmt = (v: number | null) => v != null ? `$${v.toLocaleString()}` : '--'
  const nextStatuses = STATUS_ORDER.filter(s => s !== item.status)

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-panel">
        {/* Header */}
        <div style={{ background: '#1a2744', padding: '20px 24px 16px', borderBottom: '3px solid #3472c8' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div style={{ color: '#6f9dd8', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>
                {item.id} &nbsp;|&nbsp; <CatBadge cat={item.category} />
              </div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{item.title}</div>
            </div>
            <button onClick={onClose} style={{ color: '#6f9dd8', fontSize: 20, marginTop: -4 }} className="hover:text-white">
              &times;
            </button>
          </div>
          <div className="mt-3">
            <StatusBadge status={item.status} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #dce2ef', display: 'flex', gap: 0 }}>
          {(['detail', 'uat', 'notes', ...(isOwner ? ['time'] : [])] as Array<'detail' | 'uat' | 'notes' | 'time'>).map(t => {
            let label = ''
            if (t === 'uat') label = `UAT (${uat.filter(u => u.is_complete).length}/${uat.length})`
            else if (t === 'notes') label = `Notes (${notes.length})`
            else if (t === 'time') {
              const hrs = totalMinutes > 0 ? ` (${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m)` : ''
              label = `Time${hrs}`
            }
            else label = 'Detail'
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: tab === t ? 700 : 500,
                  color: tab === t ? '#1a2744' : '#7080a0',
                  borderBottom: tab === t ? '2px solid #3472c8' : '2px solid transparent',
                  background: 'none',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div style={{ padding: '20px 24px' }}>

          {tab === 'detail' && (
            <div>
              {/* Financial / hours grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                <InfoBox label="Quoted Hours">
                  {item.quoted_hrs_lo === item.quoted_hrs_hi
                    ? `${item.quoted_hrs_lo} hrs`
                    : `${item.quoted_hrs_lo} - ${item.quoted_hrs_hi} hrs`}
                </InfoBox>
                <InfoBox label="Quoted Value">
                  {item.quoted_value_lo === item.quoted_value_hi
                    ? fmt(item.quoted_value_lo)
                    : `${fmt(item.quoted_value_lo)} - ${fmt(item.quoted_value_hi)}`}
                </InfoBox>
                <div style={{ border: '1px solid #dce2ef', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    Actual Hours
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={actualHrs}
                      onChange={e => setActualHrs(e.target.value)}
                      onBlur={saveActualHrs}
                      placeholder="--"
                      style={{ width: 60, border: '1px solid #dce2ef', borderRadius: 4, padding: '2px 6px', fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              {item.notes && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Notes
                  </div>
                  <div style={{ fontSize: 13, color: '#2c3a58', lineHeight: 1.6, background: '#f8f9fc', borderRadius: 6, padding: '10px 14px' }}>
                    {item.notes}
                  </div>
                </div>
              )}

              {/* Blockers */}
              {item.blockers && item.status !== 'uat' && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#a04000', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Blockers
                  </div>
                  <div style={{ fontSize: 13, color: '#6a2000', background: '#fff8f0', borderLeft: '3px solid #e06020', borderRadius: 4, padding: '10px 14px' }}>
                    {item.blockers}
                  </div>
                </div>
              )}

              {item.prereq && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    Prerequisite
                  </div>
                  <div style={{ fontSize: 13, color: '#2c3a58' }}>{item.prereq}</div>
                </div>
              )}

              {/* Status change */}
              <div style={{ marginTop: 24, borderTop: '1px solid #dce2ef', paddingTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Move to Status
                </div>
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map(s => (
                    <button
                      key={s}
                      onClick={() => changeStatus(s)}
                      disabled={saving}
                      style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #dce2ef', background: '#f5f6fa', color: '#2c3a58' }}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'uat' && (
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#7080a0' }}>
                  Check off each item as you verify it during client review.
                </div>
                <button
                  onClick={regenerateUat}
                  style={{ fontSize: 11, color: '#7080a0', background: 'none', border: '1px solid #dce2ef', borderRadius: 5, padding: '3px 10px', cursor: 'pointer' }}
                  title="Delete and regenerate UAT checklist from item title/notes"
                >
                  Regenerate
                </button>
              </div>
              {uat.length === 0 && <div style={{ color: '#9aa5be', fontSize: 13 }}>Loading checklist...</div>}
              <div className="flex flex-col gap-2">
                {uat.map(u => (
                  <label key={u.id} className="flex gap-3 items-start cursor-pointer group" style={{ padding: '8px 12px', borderRadius: 6, background: u.is_complete ? '#f0fbf5' : '#f8f9fc' }}>
                    <input
                      type="checkbox"
                      checked={u.is_complete}
                      onChange={() => toggleUat(u)}
                      style={{ marginTop: 2, accentColor: '#3472c8' }}
                    />
                    <span style={{ fontSize: 13, color: u.is_complete ? '#186040' : '#2c3a58', textDecoration: u.is_complete ? 'line-through' : 'none' }}>
                      {u.description}
                    </span>
                    {u.is_complete && u.completed_by && (
                      <span style={{ fontSize: 11, color: '#7080a0', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{u.completed_by}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {tab === 'notes' && (
            <div>
              <div className="flex flex-col gap-3 mb-4">
                {notes.length === 0 && <div style={{ color: '#9aa5be', fontSize: 13 }}>No notes yet.</div>}
                {notes.map(n => (
                  <div key={n.id} style={{ background: '#f8f9fc', borderRadius: 6, padding: '10px 14px' }}>
                    <div style={{ fontSize: 13, color: '#2c3a58', lineHeight: 1.6 }}>{n.content}</div>
                    <div style={{ fontSize: 11, color: '#9aa5be', marginTop: 4 }}>
                      {n.author_email} &nbsp;|&nbsp; {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                style={{ width: '100%', border: '1px solid #dce2ef', borderRadius: 6, padding: '8px 12px', fontSize: 13, resize: 'vertical' }}
              />
              <button
                onClick={addNote}
                style={{ marginTop: 8, background: '#3472c8', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Add Note
              </button>
            </div>
          )}

          {tab === 'time' && (
            <div>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <InfoBox label="Total Logged">
                  {totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : '--'}
                </InfoBox>
                <InfoBox label="Sessions">{timeEntries.filter(e => e.stopped_at !== null).length.toString()}</InfoBox>
              </div>

              {/* Active timer */}
              {activeEntry ? (
                <div style={{ background: '#e8f4ff', border: '2px solid #3472c8', borderRadius: 10, padding: '16px 18px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3472c8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Timer Running
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#1a2744', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginBottom: 12 }}>
                    {fmtElapsed(elapsed)}
                  </div>
                  <textarea
                    value={timerNote}
                    onChange={e => setTimerNote(e.target.value)}
                    placeholder="What are you working on? (optional)"
                    rows={2}
                    style={{ width: '100%', border: '1px solid #b8d4f0', borderRadius: 6, padding: '7px 10px', fontSize: 12, resize: 'none', background: '#fff', marginBottom: 12 }}
                  />
                  <button
                    onClick={stopTimer}
                    disabled={timerLoading}
                    style={{ background: '#c82020', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    className="disabled:opacity-50"
                  >
                    Stop Timer
                  </button>
                </div>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={startTimer}
                    disabled={timerLoading}
                    style={{ background: '#1f9e64', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                    className="disabled:opacity-50"
                  >
                    Start Timer
                  </button>
                  <div style={{ fontSize: 11, color: '#9aa5be', marginTop: 6 }}>
                    Tracks time spent on this item. Stop it when you step away.
                  </div>
                </div>
              )}

              {/* Past sessions */}
              {timeEntries.filter(e => e.stopped_at !== null).length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    Past Sessions
                  </div>
                  <div className="flex flex-col gap-2">
                    {timeEntries.filter(e => e.stopped_at !== null).map(e => {
                      const isOwn = e.logged_by === user?.email
                      const isEditing = editingEntryId === e.id
                      return (
                        <div key={e.id} style={{ background: '#f8f9fc', borderRadius: 6, padding: '9px 14px' }}>
                          <div className="flex items-center justify-between">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  value={editHours}
                                  onChange={e2 => setEditHours(e2.target.value)}
                                  onKeyDown={e2 => { if (e2.key === 'Enter') saveDuration(e.id); if (e2.key === 'Escape') setEditingEntryId(null) }}
                                  placeholder="0"
                                  autoFocus
                                  style={{ width: 40, border: '1px solid #3472c8', borderRadius: 4, padding: '2px 5px', fontSize: 12, textAlign: 'center' }}
                                />
                                <span style={{ fontSize: 12, color: '#7080a0' }}>h</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={59}
                                  value={editMins}
                                  onChange={e2 => setEditMins(e2.target.value)}
                                  onKeyDown={e2 => { if (e2.key === 'Enter') saveDuration(e.id); if (e2.key === 'Escape') setEditingEntryId(null) }}
                                  placeholder="0"
                                  style={{ width: 40, border: '1px solid #3472c8', borderRadius: 4, padding: '2px 5px', fontSize: 12, textAlign: 'center' }}
                                />
                                <span style={{ fontSize: 12, color: '#7080a0' }}>m</span>
                                <button onClick={() => saveDuration(e.id)} style={{ fontSize: 11, color: '#fff', background: '#3472c8', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', marginLeft: 2 }}>Save</button>
                                <button onClick={() => setEditingEntryId(null)} style={{ fontSize: 11, color: '#7080a0', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                              </div>
                            ) : (
                              <span
                                style={{ fontSize: 12, fontWeight: 700, color: '#1a2744', cursor: isOwn ? 'pointer' : 'default', borderBottom: isOwn ? '1px dashed #9aa5be' : 'none' }}
                                title={isOwn ? 'Click to edit duration' : undefined}
                                onClick={() => isOwn && startEditDuration(e)}
                              >
                                {fmtDuration(e.duration_minutes)}
                              </span>
                            )}
                            <span style={{ fontSize: 11, color: '#9aa5be' }}>
                              {new Date(e.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          {e.notes && (
                            <div style={{ fontSize: 12, color: '#4a5580', marginTop: 4 }}>{e.notes}</div>
                          )}
                          <div style={{ fontSize: 11, color: '#9aa5be', marginTop: 3 }}>{e.logged_by}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

function InfoBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #dce2ef', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1c2333' }}>{children}</div>
    </div>
  )
}
