export type Status =
  | 'pending'
  | 'open'
  | 'in_progress'
  | 'uat'
  | 'complete'
  | 'invoiced'
  | 'paid'

export const STATUS_LABELS: Record<Status, string> = {
  pending:     'Pending',
  open:        'Ready',
  in_progress: 'In Progress',
  uat:         'UAT',
  complete:    'Complete',
  invoiced:    'Invoiced',
  paid:        'Paid',
}

export const STATUS_ORDER: Status[] = [
  'pending', 'open', 'in_progress', 'uat', 'complete', 'invoiced', 'paid',
]

export type Category = 'Cat 1' | 'Cat 2' | 'Cat 3' | 'Cat 4'

export const CATEGORY_LABELS: Record<string, string> = {
  'Cat 1': 'Cat 1 - Fix Existing Issues',
  'Cat 2': 'Cat 2 - Feature Backlog',
  'Cat 3': 'Cat 3 - Phase II Core',
  'Cat 4': 'Cat 4 - Ongoing Support',
}

export interface WorkItem {
  id: string
  sort_order: number
  title: string
  category: string
  group_label: string
  quoted_hrs_lo: number | null
  quoted_hrs_hi: number | null
  quoted_value_lo: number | null
  quoted_value_hi: number | null
  status: Status
  actual_hrs: number | null
  completed_date: string | null
  notes: string | null
  blockers: string | null
  prereq: string | null
  created_at?: string
  updated_at?: string
}

export interface StatusHistory {
  id: string
  work_item_id: string
  from_status: Status | null
  to_status: Status
  note: string | null
  changed_by: string | null
  changed_at: string
}

export interface UatItem {
  id: string
  work_item_id: string
  description: string
  is_complete: boolean
  completed_at: string | null
  completed_by: string | null
  sort_order: number
}

export interface ItemNote {
  id: string
  work_item_id: string
  content: string
  author_email: string | null
  created_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  category: string | null
  amount: number
  status: 'draft' | 'sent' | 'paid'
  issued_date: string | null
  paid_date: string | null
  notes: string | null
  created_at: string
}
