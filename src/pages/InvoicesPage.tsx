import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Invoice } from '../lib/types'
import { useAuth } from '../context/AuthContext'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  draft:  { bg: '#f0f2f7', color: '#4a5580' },
  sent:   { bg: '#e8f0fc', color: '#1a4090' },
  paid:   { bg: '#e4f5ee', color: '#186040' },
}

export function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ invoice_number: '', category: '', amount: '', status: 'draft', issued_date: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false })
    if (data) setInvoices(data as Invoice[])
    setLoading(false)
  }

  async function createInvoice() {
    if (!form.invoice_number || !form.amount) return
    setSaving(true)
    const { data } = await supabase.from('invoices').insert({
      invoice_number: form.invoice_number,
      category: form.category || null,
      amount: parseFloat(form.amount),
      status: form.status,
      issued_date: form.issued_date || null,
      notes: form.notes || null,
    }).select().single()
    if (data) setInvoices(prev => [data as Invoice, ...prev])
    setForm({ invoice_number: '', category: '', amount: '', status: 'draft', issued_date: '', notes: '' })
    setShowForm(false)
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    const updates: Record<string, string | null> = { status }
    if (status === 'paid') updates.paid_date = new Date().toISOString().split('T')[0]
    await supabase.from('invoices').update(updates).eq('id', id)
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  const total = invoices.reduce((s, i) => s + i.amount, 0)
  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const outstanding = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)

  if (loading) return <div style={{ color: '#7080a0', padding: 32 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="flex items-center gap-4 mb-5">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
            Billing
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a2744' }}>Invoices</h1>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{ marginLeft: 'auto', background: '#3472c8', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          + New Invoice
        </button>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Invoiced', value: total, color: '#3472c8' },
          { label: 'Paid', value: paid, color: '#1f9e64' },
          { label: 'Outstanding', value: outstanding, color: '#c47a00' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 8, border: '1px solid #dce2ef', padding: '14px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>${s.value.toLocaleString()}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* New invoice form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dce2ef', padding: '20px 22px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2744', marginBottom: 16 }}>New Invoice</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a5580', marginBottom: 4 }}>Invoice #</label>
              <input value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 13 }} placeholder="INV-001" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a5580', marginBottom: 4 }}>Amount ($)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 13 }} placeholder="0.00" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a5580', marginBottom: 4 }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 13 }}>
                <option value="">All</option>
                <option value="Cat 1">Cat 1 - Fix Existing Issues</option>
                <option value="Cat 2">Cat 2 - Feature Backlog</option>
                <option value="Cat 3">Cat 3 - Phase II Core</option>
                <option value="Cat 4">Cat 4 - Ongoing Support</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a5580', marginBottom: 4 }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 13 }}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a5580', marginBottom: 4 }}>Issued Date</label>
              <input type="date" value={form.issued_date} onChange={e => setForm(f => ({ ...f, issued_date: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a5580', marginBottom: 4 }}>Notes</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #dce2ef', borderRadius: 6, fontSize: 13 }} placeholder="Optional" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createInvoice} disabled={saving} style={{ background: '#3472c8', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Create Invoice'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: '#f0f2f7', color: '#4a5580', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invoice list */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dce2ef', overflow: 'hidden' }}>
        {invoices.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9aa5be' }}>No invoices yet. Create the first one above.</div>
        )}
        {invoices.map((inv, idx) => (
          <div key={inv.id} style={{ padding: '14px 20px', borderBottom: idx < invoices.length - 1 ? '1px solid #dce2ef' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#1a2744', fontSize: 14 }}>{inv.invoice_number}</div>
              <div style={{ fontSize: 12, color: '#7080a0', marginTop: 2 }}>
                {inv.category ?? 'All categories'} &nbsp;|&nbsp; {inv.issued_date ?? 'No date'}
                {inv.notes && <> &nbsp;|&nbsp; {inv.notes}</>}
              </div>
            </div>
            <div style={{ fontWeight: 800, color: '#2f6ec4', fontSize: 18 }}>
              ${inv.amount.toLocaleString()}
            </div>
            <span style={{ padding: '3px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, ...STATUS_STYLE[inv.status] }}>
              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
            </span>
            {inv.status !== 'paid' && (
              <div className="flex gap-2">
                {inv.status === 'draft' && (
                  <button onClick={() => updateStatus(inv.id, 'sent')} style={{ padding: '4px 10px', background: '#e8f0fc', color: '#1a4090', border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Mark Sent
                  </button>
                )}
                <button onClick={() => updateStatus(inv.id, 'paid')} style={{ padding: '4px 10px', background: '#e4f5ee', color: '#186040', border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Mark Paid
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
