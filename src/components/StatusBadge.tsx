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
  const cls = cat === 'Cat 1' ? 'cat-1' : cat === 'Cat 2' ? 'cat-2' : cat === 'Cat 3' ? 'cat-3' : 'cat-4'
  return (
    <span className={`${cls} inline-block px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap`}>
      {cat}
    </span>
  )
}
