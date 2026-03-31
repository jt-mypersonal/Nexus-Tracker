import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { WorkItem, Status } from '../lib/types'
import { STATUS_LABELS } from '../lib/types'
import { StatusBadge } from '../components/StatusBadge'

const STATUS_COLORS: Record<Status, string> = {
  pending:     '#e06020',
  open:        '#3472c8',
  in_progress: '#0a8050',
  uat:         '#6020a0',
  complete:    '#1f9e64',
  invoiced:    '#c47a00',
  paid:        '#0a5030',
}

const CAT_COLORS: Record<string, string> = {
  'Cat 1':  '#c82020',
  'Cat 2':  '#3472c8',
  'Cat 3':  '#4a08a0',
  'Cat 4A': '#6020a0',
  'Cat 4B': '#2830b8',
  'Cat 4C': '#a01060',
  'Cat 4D': '#a03010',
  'Cat 5':  '#5a6080',
}

export function DashboardPage() {
  const [items, setItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('work_items').select('*').order('sort_order').then(({ data }) => {
      if (data) setItems(data as WorkItem[])
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ color: '#7080a0', padding: 32 }}>Loading...</div>

  const billable = items.filter(i => i.category !== 'Cat 5')
  const totalLo = billable.reduce((s, i) => s + (i.quoted_value_lo ?? 0), 0)
  const totalHi = billable.reduce((s, i) => s + (i.quoted_value_hi ?? 0), 0)
  const completedValue = billable
    .filter(i => ['complete', 'invoiced', 'paid'].includes(i.status))
    .reduce((s, i) => s + ((i.quoted_value_lo ?? 0) + (i.quoted_value_hi ?? 0)) / 2, 0)
  const pct = totalLo > 0 ? Math.round((completedValue / ((totalLo + totalHi) / 2)) * 100) : 0

  const byStatus = items.reduce<Record<string, WorkItem[]>>((acc, i) => {
    (acc[i.status] = acc[i.status] || []).push(i)
    return acc
  }, {})

  // Build category breakdown -- only show categories that have items
  const catKeys = ['Cat 1', 'Cat 2', 'Cat 3', 'Cat 4A', 'Cat 4B', 'Cat 4C', 'Cat 4D', 'Cat 5']
  const byCategory = catKeys
    .map(cat => {
      const catItems = items.filter(i => i.category === cat)
      return {
        cat,
        total: catItems.length,
        done: catItems.filter(i => ['complete', 'invoiced', 'paid'].includes(i.status)).length,
        valueLo: catItems.reduce((s, i) => s + (i.quoted_value_lo ?? 0), 0),
        valueHi: catItems.reduce((s, i) => s + (i.quoted_value_hi ?? 0), 0),
      }
    })
    .filter(c => c.total > 0)

  const recentlyDone = items
    .filter(i => i.status === 'complete' && i.completed_date)
    .sort((a, b) => (b.completed_date ?? '').localeCompare(a.completed_date ?? ''))
    .slice(0, 5)

  const blocked = items.filter(i => i.blockers && i.status !== 'complete' && i.status !== 'invoiced' && i.status !== 'paid')

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Phase 2 Execution
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2744' }}>Dashboard</h1>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dce2ef', padding: '18px 22px', marginBottom: 20 }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2744' }}>Overall Completion (Billable)</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#3472c8' }}>{pct}%</span>
        </div>
        <div style={{ height: 10, background: '#e8f0fc', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #3472c8, #1f9e64)', borderRadius: 5, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#7080a0' }}>
          Quoted NTE: <strong>${totalLo.toLocaleString()} - ${totalHi.toLocaleString()}</strong>
          &nbsp; | &nbsp;
          Completed value: <strong>~${Math.round(completedValue).toLocaleString()}</strong>
        </div>
      </div>

      {/* Status strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 20 }}>
        {(['pending', 'open', 'in_progress', 'uat', 'complete', 'invoiced', 'paid'] as Status[]).map(s => (
          <div key={s} style={{ background: '#fff', borderRadius: 8, border: '1px solid #dce2ef', borderTop: `3px solid ${STATUS_COLORS[s]}`, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: STATUS_COLORS[s], lineHeight: 1 }}>
              {byStatus[s]?.length ?? 0}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
              {STATUS_LABELS[s]}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Category breakdown */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dce2ef', padding: '18px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            By Category
          </div>
          {byCategory.map(c => (
            <div key={c.cat} style={{ marginBottom: 10 }}>
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: 12, fontWeight: 700, color: CAT_COLORS[c.cat] ?? '#1a2744' }}>{c.cat}</span>
                <span style={{ fontSize: 11, color: '#7080a0' }}>
                  {c.done}/{c.total}{' '}
                  <span style={{ color: '#2f6ec4', fontWeight: 600 }}>
                    ${c.valueLo.toLocaleString()} - ${c.valueHi.toLocaleString()}
                  </span>
                </span>
              </div>
              <div style={{ height: 5, background: '#e8f0fc', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${c.total > 0 ? Math.round((c.done / c.total) * 100) : 0}%`,
                  background: CAT_COLORS[c.cat] ?? '#3472c8',
                  borderRadius: 3,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Blockers */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dce2ef', padding: '18px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#a04000', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Active Blockers ({blocked.length})
          </div>
          {blocked.length === 0 && <div style={{ fontSize: 13, color: '#9aa5be' }}>No active blockers.</div>}
          <div className="flex flex-col gap-2">
            {blocked.slice(0, 6).map(i => (
              <div key={i.id} style={{ fontSize: 12, borderLeft: '3px solid #e06020', paddingLeft: 10, color: '#2c3a58' }}>
                <strong>{i.id}</strong> {i.title}
                <div style={{ color: '#9aa5be', fontSize: 11, marginTop: 2 }}>{i.blockers}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently completed */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dce2ef', padding: '18px 22px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Recently Completed
        </div>
        {recentlyDone.length === 0 && <div style={{ fontSize: 13, color: '#9aa5be' }}>Nothing completed yet.</div>}
        <div className="flex flex-col gap-2">
          {recentlyDone.map(i => (
            <div key={i.id} className="flex items-center gap-3" style={{ fontSize: 13 }}>
              <StatusBadge status={i.status} />
              <span style={{ color: '#7080a0', fontSize: 11 }}>{i.id}</span>
              <span style={{ color: '#1a2744', fontWeight: 600 }}>{i.title}</span>
              <span style={{ color: '#9aa5be', marginLeft: 'auto', fontSize: 11, whiteSpace: 'nowrap' }}>{i.completed_date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
