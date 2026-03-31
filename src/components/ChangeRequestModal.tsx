import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { WorkItem } from '../lib/types'
import { useAuth } from '../context/AuthContext'

interface Props {
  item: WorkItem | null
  onClose: () => void
  onSubmitted: () => void
}

export function ChangeRequestModal({ item, onClose, onSubmitted }: Props) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requester, setRequester] = useState(user?.email ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !requester.trim()) {
      setError('Title, description, and requester are required.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error: dbErr } = await supabase.from('change_requests').insert({
      work_item_id:  item?.id ?? null,
      title:         title.trim(),
      description:   description.trim(),
      requested_by:  requester.trim(),
      status:        'pending',
    })
    if (dbErr) {
      setError(dbErr.message)
      setSubmitting(false)
    } else {
      onSubmitted()
      onClose()
    }
  }

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,0.55)', zIndex: 50 }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 'min(560px, 94vw)', background: '#fff', borderRadius: 12,
        boxShadow: '0 8px 60px rgba(0,0,0,0.25)', zIndex: 51, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: '#1a2744', padding: '18px 24px 14px', borderBottom: '3px solid #3472c8' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div style={{ color: '#6f9dd8', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                Change Request
              </div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>
                {item ? `${item.id} - ${item.title}` : 'General Change Request'}
              </div>
            </div>
            <button onClick={onClose} style={{ color: '#6f9dd8', fontSize: 22, marginTop: -4, lineHeight: 1 }} className="hover:text-white">
              &times;
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
          {error && (
            <div style={{ background: '#fdecea', color: '#900020', border: '1px solid #f0b0b0', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Change Title <span style={{ color: '#e04040' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Brief description of the change needed..."
              style={{ width: '100%', border: '1px solid #dce2ef', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Description <span style={{ color: '#e04040' }}>*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the change in detail. Include what currently happens, what should happen, and why this change is needed..."
              rows={5}
              style={{ width: '100%', border: '1px solid #dce2ef', borderRadius: 6, padding: '8px 12px', fontSize: 13, resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7080a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Requested By <span style={{ color: '#e04040' }}>*</span>
            </label>
            <input
              type="text"
              value={requester}
              onChange={e => setRequester(e.target.value)}
              style={{ width: '100%', border: '1px solid #dce2ef', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '1px solid #dce2ef', background: '#f5f6fa', color: '#4a5580', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '8px 22px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: '#3472c8', color: '#fff', cursor: 'pointer' }}
              className="disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
