import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { STATUS_ORDER, STATUS_LABELS } from '../lib/types'
import type { WorkItem, UatItem, ItemNote, Status } from '../lib/types'
import { StatusBadge, CatBadge } from './StatusBadge'
import { generateUatItems } from '../lib/uat'
import { useAuth } from '../context/AuthContext'

interface Props {
  item: WorkItem
  onClose: () => void
  onUpdated: (item: WorkItem) => void
}

export function ItemDetailDrawer({ item, onClose, onUpdated }: Props) {
  const { user } = useAuth()
  const [uat, setUat] = useState<UatItem[]>([])
  const [notes, setNotes] = useState<ItemNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [actualHrs, setActualHrs] = useState<string>(item.actual_hrs?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'detail' | 'uat' | 'notes'>('detail')

  useEffect(() => {
    loadUat()
    loadNotes()
  }, [item.id])

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
          {(['detail', 'uat', 'notes'] as const).map(t => (
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
              }}
            >
              {t === 'uat' ? `UAT (${uat.filter(u => u.is_complete).length}/${uat.length})` : t === 'notes' ? `Notes (${notes.length})` : 'Detail'}
            </button>
          ))}
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
              {item.blockers && (
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
              <div style={{ fontSize: 12, color: '#7080a0', marginBottom: 16 }}>
                Check off each item as you verify it during client review.
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
