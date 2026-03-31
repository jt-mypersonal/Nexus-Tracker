import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { WorkItem, Status } from '../lib/types'
import { STATUS_LABELS, STATUS_ORDER } from '../lib/types'
import { StatusBadge, CatBadge } from '../components/StatusBadge'
import { ItemDetailDrawer } from '../components/ItemDetailDrawer'

const CATEGORIES = ['All', 'Cat 1', 'Cat 2', 'Cat 3', 'Cat 4']
const STATUSES: Array<'All' | Status> = ['All', ...STATUS_ORDER]

export function WorkItemsPage() {
  const [items, setItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All')
  const [selected, setSelected] = useState<WorkItem | null>(null)
  const [sortCol, setSortCol] = useState<'id' | 'status' | 'category' | 'quoted_value_hi'>('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    supabase.from('work_items').select('*').order('sort_order').then(({ data }) => {
      if (data) setItems(data as WorkItem[])
      setLoading(false)
    })
  }, [])

  function sort(col: typeof sortCol) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const filtered = items
    .filter(i => {
      const q = search.toLowerCase()
      if (q && !i.title.toLowerCase().includes(q) && !i.id.toLowerCase().includes(q) && !(i.notes ?? '').toLowerCase().includes(q)) return false
      if (catFilter !== 'All' && i.category !== catFilter) return false
      if (statusFilter !== 'All' && i.status !== statusFilter) return false
      return true
    })
    .sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0
      if (sortCol === 'id') { va = a.sort_order; vb = b.sort_order }
      if (sortCol === 'status') { va = STATUS_ORDER.indexOf(a.status); vb = STATUS_ORDER.indexOf(b.status) }
      if (sortCol === 'category') { va = a.category; vb = b.category }
      if (sortCol === 'quoted_value_hi') { va = a.quoted_value_hi ?? 0; vb = b.quoted_value_hi ?? 0 }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const totalQuoted = filtered.reduce((s, i) => s + ((i.quoted_value_lo ?? 0) + (i.quoted_value_hi ?? 0)) / 2, 0)

  function ThSort({ col, label }: { col: typeof sortCol; label: string }) {
    const active = sortCol === col
    return (
      <th
        onClick={() => sort(col)}
        style={{ padding: '9px 13px', fontSize: 11, fontWeight: 600, color: active ? '#7dc8f8' : '#adc4e0', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid #2a3a60' }}
      >
        {label} {active ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : ''}
      </th>
    )
  }

  function handleUpdated(updated: WorkItem) {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    setSelected(updated)
  }

  const fmt = (lo: number | null, hi: number | null) => {
    if (lo == null) return '--'
    if (lo === hi) return `$${lo.toLocaleString()}`
    return `$${lo.toLocaleString()} - $${hi?.toLocaleString()}`
  }

  if (loading) return <div style={{ color: '#7080a0', padding: 32 }}>Loading...</div>

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-5" style={{ flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
            Phase 2 Execution
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a2744' }}>Work Items</h1>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#7080a0' }}>
          {filtered.length} items &nbsp;|&nbsp; est. avg <strong>${Math.round(totalQuoted).toLocaleString()}</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items..."
          style={{ padding: '7px 12px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 13, minWidth: 220 }}
        />
        <div className="flex gap-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              style={{
                padding: '5px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: catFilter === c ? '#1a2744' : '#fff',
                color: catFilter === c ? '#fff' : '#4a5580',
                border: catFilter === c ? '1px solid #1a2744' : '1px solid #dce2ef',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'All' | Status)}
          style={{ padding: '6px 10px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 12, color: '#2c3a58' }}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #dce2ef' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <colgroup>
            <col style={{ width: 60 }} />
            <col />
            <col style={{ width: 80 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 145 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
          </colgroup>
          <thead>
            <tr style={{ background: '#1a2744' }}>
              <ThSort col="id" label="#" />
              <th style={{ padding: '9px 13px', fontSize: 11, fontWeight: 600, color: '#adc4e0', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'left', border: '1px solid #2a3a60' }}>
                Item
              </th>
              <ThSort col="category" label="Cat" />
              <th style={{ padding: '9px 13px', fontSize: 11, fontWeight: 600, color: '#adc4e0', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', border: '1px solid #2a3a60' }}>
                Quoted Hrs
              </th>
              <ThSort col="quoted_value_hi" label="Quoted Value" />
              <ThSort col="status" label="Status" />
              <th style={{ padding: '9px 13px', fontSize: 11, fontWeight: 600, color: '#adc4e0', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', border: '1px solid #2a3a60' }}>
                Actual Hrs
              </th>
            </tr>
          </thead>
          <tbody id="items-tbody">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9aa5be' }}>No items match your filters.</td>
              </tr>
            )}
            {filtered.map((item, idx) => {
              const isGroupStart = idx === 0 || filtered[idx - 1].group_label !== item.group_label
              return [
                isGroupStart && (
                  <tr key={`g-${item.id}`} style={{ background: '#edf1f8' }}>
                    <td colSpan={7} style={{ padding: '6px 13px', fontSize: 11, fontWeight: 700, color: '#4a5580', letterSpacing: '0.05em', border: '1px solid #dce2ef' }}>
                      {item.group_label}
                    </td>
                  </tr>
                ),
                <tr
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f8f9fc' }}
                  className="hover:bg-blue-50"
                >
                  <td style={{ padding: '9px 13px', fontSize: 11, fontWeight: 700, color: '#9aa5be', border: '1px solid #dce2ef' }}>
                    {item.id}
                  </td>
                  <td style={{ padding: '9px 13px', border: '1px solid #dce2ef', color: '#1c2333' }}>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    {item.blockers && (
                      <div style={{ fontSize: 11, color: '#c06020', marginTop: 2 }}>
                        Blocked: {item.blockers.slice(0, 80)}{item.blockers.length > 80 ? '...' : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '9px 13px', border: '1px solid #dce2ef' }}>
                    <CatBadge cat={item.category} />
                  </td>
                  <td style={{ padding: '9px 13px', border: '1px solid #dce2ef', textAlign: 'center', color: '#4a5580', whiteSpace: 'nowrap' }}>
                    {item.quoted_hrs_lo === item.quoted_hrs_hi ? item.quoted_hrs_lo : `${item.quoted_hrs_lo} - ${item.quoted_hrs_hi}`}
                  </td>
                  <td style={{ padding: '9px 13px', border: '1px solid #dce2ef', fontWeight: 600, color: '#1a4090', whiteSpace: 'nowrap' }}>
                    {fmt(item.quoted_value_lo, item.quoted_value_hi)}
                  </td>
                  <td style={{ padding: '9px 13px', border: '1px solid #dce2ef' }}>
                    <StatusBadge status={item.status} />
                  </td>
                  <td style={{ padding: '9px 13px', border: '1px solid #dce2ef', textAlign: 'center', fontWeight: 600, color: '#1f6040' }}>
                    {item.actual_hrs ?? '--'}
                  </td>
                </tr>,
              ]
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <ItemDetailDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}
