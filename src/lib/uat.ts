// Auto-generates UAT checklist items based on work item title/content
export function generateUatItems(title: string, notes: string | null): string[] {
  const t = (title + ' ' + (notes || '')).toLowerCase()
  const items: string[] = []

  if (t.includes('cors') || t.includes('security') || t.includes('auth'))
    items.push('Security headers verified in browser devtools', 'No CORS errors in browser console', 'Auth flow tested end-to-end')

  if (t.includes('filter') || t.includes('search'))
    items.push('Filter returns correct results', 'No results state shown when no match', 'Filter clears correctly', 'Works on mobile viewport')

  if (t.includes('pdf') || t.includes('print') || t.includes('report'))
    items.push('PDF generates without error', 'All fields populated correctly', 'Layout correct at letter size', 'Logo and headers render cleanly')

  if (t.includes('upload') || t.includes('import') || t.includes('ingest'))
    items.push('File upload accepts correct format', 'Validation error shown for invalid file', 'Success confirmation displayed', 'Data visible in grid after upload')

  if (t.includes('email') || t.includes('batch') || t.includes('notification'))
    items.push('Email received at configured address', 'Subject line and body correct', 'No duplicate sends on retry', 'Stub mode confirmed off in prod')

  if (t.includes('map') || t.includes('pipeline') || t.includes('layer'))
    items.push('Map loads without errors', 'All layers toggle on/off correctly', 'Click/hover interactions work', 'Mobile pinch-zoom functional')

  if (t.includes('worker') || t.includes('job') || t.includes('background'))
    items.push('Worker visible in admin console', 'Manual trigger executes successfully', 'Run history records correctly', 'Toggle enable/disable works')

  if (t.includes('form') || t.includes('modal') || t.includes('input'))
    items.push('All fields save correctly', 'Validation messages shown on missing required fields', 'Cancel/close does not save', 'Pre-populated fields accurate')

  if (t.includes('sort') || t.includes('grid') || t.includes('table'))
    items.push('Sort toggles ascending/descending', 'Sort persists on filter change', 'All columns sortable where expected', 'Empty state renders correctly')

  if (t.includes('delete') || t.includes('deactivate') || t.includes('remove'))
    items.push('Record hidden after soft delete', 'Cascading records also hidden', 'Restore path tested (if applicable)', 'Confirm dialog prevents accidental deletes')

  if (t.includes('integration') || t.includes('smartsheet') || t.includes('ftp') || t.includes('api'))
    items.push('API credentials configured correctly', 'Data pulls from source correctly', 'Error handling shown when source unavailable', 'Data matches source system')

  if (t.includes('password') || t.includes('hash') || t.includes('bcrypt'))
    items.push('Login works with existing credentials', 'Password change persists', 'No plain-text storage confirmed in DB')

  if (t.includes('compliance') || t.includes('oq') || t.includes('expir'))
    items.push('Expiry dates display correctly', 'Expiring soon threshold triggers correctly', 'Dashboard counts match detail view')

  // Default fallback
  if (items.length === 0) {
    items.push(
      'Feature works as described in notes',
      'No console errors during use',
      'Mobile viewport checked',
      'Tested on sandbox before production deploy',
    )
  }

  // Always add
  items.push('Tested on sandbox', 'No regression in related features')

  return [...new Set(items)] // deduplicate
}
