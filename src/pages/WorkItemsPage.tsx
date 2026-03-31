import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { WorkItem, NqItem, ChangeRequest, Status } from '../lib/types'
import { STATUS_LABELS, STATUS_ORDER } from '../lib/types'
import { StatusBadge, CatBadge, NqStatusBadge, CrStatusBadge } from '../components/StatusBadge'
import { ItemDetailDrawer } from '../components/ItemDetailDrawer'
import { ChangeRequestModal } from '../components/ChangeRequestModal'

const CATEGORIES = ['All', 'Cat 1', 'Cat 2', 'Cat 3A', 'Cat 3B', 'Cat 3C', 'Cat 3D', 'Cat 3E', 'Cat 4']
const STATUSES: Array<'All' | Status> = ['All', ...STATUS_ORDER]

type MainTab = 'items' | 'nq' | 'cr'

export function WorkItemsPage() {
  const [mainTab, setMainTab] = useState<MainTab>('items')

  // Work items state
  const [items, setItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All')
  const [selected, setSelected] = useState<WorkItem | null>(null)
  const [crModalOpen, setCrModalOpen] = useState(false)
  const [crModalItem, setCrModalItem] = useState<WorkItem | null>(null)
  const [sortCol, setSortCol] = useState<'id' | 'status' | 'category' | 'quoted_value_hi'>('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // UAT completion summary: set of work_item_ids where all UAT items are checked
  const [uatReady, setUatReady] = useState<Set<string>>(new Set())

  // NQ items state
  const [nqItems, setNqItems] = useState<NqItem[]>([])
  const [nqLoaded, setNqLoaded] = useState(false)

  // Change requests state
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([])
  const [crLoaded, setCrLoaded] = useState(false)
  const [crRefresh, setCrRefresh] = useState(0)

  useEffect(() => {
    supabase.from('work_items').select('*').order('sort_order').then(({ data }) => {
      if (data) setItems(data as WorkItem[])
      setLoading(false)
    })
    loadUatSummary()
  }, [])

  async function loadUatSummary() {
    const { data } = await supabase.from('uat_items').select('work_item_id, is_complete')
    if (!data || data.length === 0) return
    const totals: Record<string, { total: number; done: number }> = {}
    for (const row of data) {
      const id = row.work_item_id as string
      if (!totals[id]) totals[id] = { total: 0, done: 0 }
      totals[id].total++
      if (row.is_complete) totals[id].done++
    }
    const ready = new Set(Object.entries(totals).filter(([, v]) => v.total > 0 && v.total === v.done).map(([k]) => k))
    setUatReady(ready)
  }

  useEffect(() => {
    if (mainTab === 'nq' && !nqLoaded) {
      supabase.from('nq_items').select('*').order('sort_order').then(({ data }) => {
        if (data) setNqItems(data as NqItem[])
        setNqLoaded(true)
      })
    }
    if (mainTab === 'cr' && !crLoaded) {
      loadChangeRequests()
    }
  }, [mainTab])

  useEffect(() => {
    if (crRefresh > 0) loadChangeRequests()
  }, [crRefresh])

  async function loadChangeRequests() {
    const { data } = await supabase
      .from('change_requests')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (data) setChangeRequests(data as ChangeRequest[])
    setCrLoaded(true)
  }

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

  function handleUpdated(updated: WorkItem) {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    setSelected(updated)
  }

  const fmt = (lo: number | null, hi: number | null) => {
    if (lo == null) return '--'
    if (lo === hi) return `$${lo.toLocaleString()}`
    return `$${lo.toLocaleString()} - $${hi?.toLocaleString()}`
  }

  function ThSort({ col, label }: { col: typeof sortCol; label: string }) {
    const active = sortCol === col
    return (
      <th
        onClick={() => sort(col)}
        style={{ padding: '9px 13px', fontSize: 11, fontWeight: 600, color: active ? '#7dc8f8' : '#adc4e0', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid #2a3a60' }}
      >
        {label} {active ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
      </th>
    )
  }

  const tabStyle = (t: MainTab) => ({
    padding: '10px 22px',
    fontSize: 14,
    fontWeight: mainTab === t ? 700 : 500,
    color: mainTab === t ? '#1a2744' : '#7080a0',
    borderBottom: mainTab === t ? '3px solid #3472c8' : '3px solid transparent',
    background: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  })

  if (loading) return <div style={{ color: '#7080a0', padding: 32 }}>Loading...</div>

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
            Phase 2 Execution
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a2744' }}>Work Items</h1>
        </div>
      </div>

      {/* Main tab bar */}
      <div style={{ borderBottom: '1px solid #dce2ef', display: 'flex', gap: 0, marginBottom: 20 }}>
        <button style={tabStyle('items')} onClick={() => setMainTab('items')}>
          Work Items ({items.length})
        </button>
        <button style={tabStyle('nq')} onClick={() => setMainTab('nq')}>
          Complimentary Work {nqLoaded ? `(${nqItems.length})` : ''}
        </button>
        <button style={tabStyle('cr')} onClick={() => setMainTab('cr')}>
          Change Requests {crLoaded ? `(${changeRequests.length})` : ''}
        </button>
      </div>

      {/* ── WORK ITEMS TAB ── */}
      {mainTab === 'items' && (
        <>
          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              style={{ padding: '7px 12px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 13, minWidth: 200 }}
            />
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  style={{
                    padding: '4px 11px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer',
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
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#7080a0', whiteSpace: 'nowrap' }}>
              {filtered.length} items &nbsp;|&nbsp; avg est. <strong>${Math.round(totalQuoted).toLocaleString()}</strong>
            </div>
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
                <col style={{ width: 110 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 70 }} />
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
                  <th style={{ padding: '9px 13px', fontSize: 11, fontWeight: 600, color: '#adc4e0', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', border: '1px solid #2a3a60' }}>
                    CR
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#9aa5be' }}>No items match your filters.</td>
                  </tr>
                )}
                {filtered.map((item, idx) => {
                  const isGroupStart = idx === 0 || filtered[idx - 1].group_label !== item.group_label
                  const allUatDone = uatReady.has(item.id)
                  return [
                    isGroupStart && (
                      <tr key={`g-${item.id}`} style={{ background: '#edf1f8' }}>
                        <td colSpan={8} style={{ padding: '6px 13px', fontSize: 11, fontWeight: 700, color: '#4a5580', letterSpacing: '0.05em', border: '1px solid #dce2ef' }}>
                          {item.group_label}
                        </td>
                      </tr>
                    ),
                    <tr
                      key={item.id}
                      onClick={() => setSelected(item)}
                      style={{
                        cursor: 'pointer',
                        background: allUatDone ? '#edfbf3' : idx % 2 === 0 ? '#fff' : '#f8f9fc',
                        borderLeft: allUatDone ? '3px solid #1f9e64' : undefined,
                      }}
                      className={allUatDone ? 'hover:bg-green-50' : 'hover:bg-blue-50'}
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
                      <td style={{ padding: '6px 8px', border: '1px solid #dce2ef', textAlign: 'center' }}>
                        <button
                          onClick={e => { e.stopPropagation(); setCrModalItem(item); setCrModalOpen(true) }}
                          title="Submit Change Request"
                          style={{ background: '#e8f0fc', color: '#1a4090', border: '1px solid #b0c8f0', borderRadius: 12, padding: '3px 9px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          className="hover:bg-blue-100"
                        >
                          + CR
                        </button>
                      </td>
                    </tr>,
                  ]
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── NQ ITEMS TAB ── */}
      {mainTab === 'nq' && (
        <>
          <div style={{ background: '#fff8e4', border: '1px solid #f0d880', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#6a4800' }}>
            Work delivered outside the Phase 2 proposal scope at no charge to NexusIntegrity. This includes improvements, fixes, and recommendations identified during development.
          </div>

          {!nqLoaded && <div style={{ color: '#9aa5be', padding: 24 }}>Loading...</div>}
          {nqLoaded && nqItems.length === 0 && (
            <div style={{ color: '#9aa5be', padding: 24 }}>No NQ items found. Run the migration SQL to seed them.</div>
          )}
          {nqLoaded && nqItems.length > 0 && (
            <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #dce2ef' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <colgroup>
                  <col style={{ width: 80 }} />
                  <col />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 120 }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#1a2744' }}>
                    {['ID', 'Item', 'Category', 'Status'].map(h => (
                      <th key={h} style={{ padding: '9px 13px', fontSize: 11, fontWeight: 600, color: '#adc4e0', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'left', border: '1px solid #2a3a60' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nqItems.map((nq, idx) => (
                    <tr key={nq.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ padding: '9px 13px', fontSize: 11, fontWeight: 700, color: '#9aa5be', border: '1px solid #dce2ef' }}>
                        {nq.id}
                      </td>
                      <td style={{ padding: '9px 13px', border: '1px solid #dce2ef', color: '#1c2333' }}>
                        <div style={{ fontWeight: 600 }}>{nq.title}</div>
                        {nq.description && (
                          <div style={{ fontSize: 11, color: '#7080a0', marginTop: 2 }}>{nq.description}</div>
                        )}
                      </td>
                      <td style={{ padding: '9px 13px', border: '1px solid #dce2ef' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#4a5580', background: '#f0f2f7', borderRadius: 4, padding: '2px 7px' }}>
                          {nq.category}
                        </span>
                      </td>
                      <td style={{ padding: '9px 13px', border: '1px solid #dce2ef' }}>
                        <NqStatusBadge status={nq.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── CHANGE REQUESTS TAB ── */}
      {mainTab === 'cr' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontSize: 13, color: '#7080a0' }}>
              All change requests from the team. Submit one from any work item row using the + CR button.
            </div>
            <button
              onClick={() => { setCrModalItem(null); setCrModalOpen(true) }}
              style={{ background: '#3472c8', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              + New Request
            </button>
          </div>

          {!crLoaded && <div style={{ color: '#9aa5be', padding: 24 }}>Loading...</div>}
          {crLoaded && changeRequests.length === 0 && (
            <div style={{ color: '#9aa5be', padding: 24 }}>No change requests yet.</div>
          )}
          {crLoaded && changeRequests.length > 0 && (
            <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #dce2ef' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <colgroup>
                  <col style={{ width: 110 }} />
                  <col style={{ width: 80 }} />
                  <col />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 130 }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#1a2744' }}>
                    {['Date', 'Item', 'Title / Description', 'Requested By', 'Status'].map(h => (
                      <th key={h} style={{ padding: '9px 13px', fontSize: 11, fontWeight: 600, color: '#adc4e0', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'left', border: '1px solid #2a3a60' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {changeRequests.map((cr, idx) => (
                    <tr key={cr.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ padding: '9px 13px', fontSize: 11, color: '#7080a0', border: '1px solid #dce2ef', whiteSpace: 'nowrap' }}>
                        {new Date(cr.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '9px 13px', fontSize: 11, fontWeight: 700, color: '#9aa5be', border: '1px solid #dce2ef' }}>
                        {cr.work_item_id ?? '--'}
                      </td>
                      <td style={{ padding: '9px 13px', border: '1px solid #dce2ef' }}>
                        <div style={{ fontWeight: 600, color: '#1c2333' }}>{cr.title}</div>
                        <div style={{ fontSize: 11, color: '#7080a0', marginTop: 2, lineHeight: 1.5 }}>{cr.description}</div>
                        {cr.review_notes && (
                          <div style={{ fontSize: 11, color: '#1a4090', marginTop: 4, fontStyle: 'italic' }}>
                            Review: {cr.review_notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '9px 13px', fontSize: 12, color: '#4a5580', border: '1px solid #dce2ef' }}>
                        {cr.requested_by}
                      </td>
                      <td style={{ padding: '9px 13px', border: '1px solid #dce2ef' }}>
                        <CrStatusBadge status={cr.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Drawers and modals */}
      {selected && (
        <ItemDetailDrawer
          item={selected}
          onClose={() => { setSelected(null); loadUatSummary() }}
          onUpdated={handleUpdated}
        />
      )}

      {crModalOpen && (
        <ChangeRequestModal
          item={crModalItem}
          onClose={() => { setCrModalOpen(false); setCrModalItem(null) }}
          onSubmitted={() => { setCrModalOpen(false); setCrModalItem(null); setCrRefresh(r => r + 1) }}
        />
      )}
    </div>
  )
}
