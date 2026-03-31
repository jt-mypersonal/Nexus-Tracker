import type { Status } from '../lib/types'
import { STATUS_LABELS } from '../lib/types'

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`pill-${status} inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function CatBadge({ cat }: { cat: string }) {
  let cls = 'cat-4'
  if (cat === 'Cat 1') cls = 'cat-1'
  else if (cat === 'Cat 2') cls = 'cat-2'
  else if (cat === 'Cat 3A') cls = 'cat-3a'
  else if (cat === 'Cat 3B') cls = 'cat-3b'
  else if (cat === 'Cat 3C') cls = 'cat-3c'
  else if (cat === 'Cat 3D') cls = 'cat-3d'
  else if (cat === 'Cat 3E') cls = 'cat-3e'
  else if (cat.startsWith('Cat 3')) cls = 'cat-3'
  return (
    <span className={`${cls} inline-block px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap`}>
      {cat}
    </span>
  )
}

export function NqStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    delivered:   'Delivered',
    in_progress: 'In Progress',
    suggested:   'Suggested',
    escalated:   'Escalated',
  }
  return (
    <span className={`nq-${status} inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
      {labels[status] ?? status}
    </span>
  )
}

export function CrStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    pending:        'Pending',
    reviewed:       'Reviewed',
    approved:       'Approved',
    rejected:       'Rejected',
    added_to_scope: 'Added to Scope',
  }
  return (
    <span className={`cr-${status} inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
      {labels[status] ?? status}
    </span>
  )
}
