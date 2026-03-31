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

export const CATEGORY_LABELS: Record<string, string> = {
  'Cat 1':  'Cat 1 - Fix Existing Issues',
  'Cat 2':  'Cat 2 - Feature Backlog',
  'Cat 3':  'Cat 3 - ArcGIS Departure and Native iPad Application',
  'Cat 4A': 'Cat 4A - Platform Foundation and Maps',
  'Cat 4B': 'Cat 4B - Data and Financial Integrations',
  'Cat 4C': 'Cat 4C - Automation, Notifications, and Compliance',
  'Cat 4D': 'Cat 4D - Forms and Platform Enhancements',
  'Cat 5':  'Cat 5 - Ongoing Support',
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

export interface TimeEntry {
  id: string
  work_item_id: string
  started_at: string
  stopped_at: string | null
  duration_minutes: number | null
  notes: string | null
  logged_by: string | null
  created_at: string
}

export interface ChangeRequest {
  id: string
  work_item_id: string | null
  title: string
  description: string
  requested_by: string
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'added_to_scope'
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  review_notes: string | null
}

export interface NqItem {
  id: string
  sort_order: number
  title: string
  description: string
  category: string
  status: 'delivered' | 'in_progress' | 'suggested' | 'escalated'
  delivered_date: string | null
  est_hrs_lo: number | null
  est_hrs_hi: number | null
  est_value_lo: number | null
  est_value_hi: number | null
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
