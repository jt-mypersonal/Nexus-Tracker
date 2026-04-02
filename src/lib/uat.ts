// Generates 3-4 plain end-user UAT steps based on the work item
export function generateUatItems(title: string, notes: string | null): string[] {
  const t = (title + ' ' + (notes || '')).toLowerCase()

  // --- Technical / infrastructure tasks (no user-facing verification) ---

  if (t.includes('audit') || t.includes('codebase') || t.includes('db audit') || t.includes('schema audit'))
    return [
      'Review the findings document with your team and confirm all identified issues are reflected in the work plan',
      'Confirm no critical findings remain unresolved or unscheduled',
    ]

  if (t.includes('cors'))
    return [
      'Open the application in your browser and confirm the page loads without errors',
      'Open browser DevTools (F12), go to the Console tab, and confirm no CORS errors appear',
    ]

  if (t.includes('migration') || t.includes('tracking table'))
    return [
      'Confirm with the development team that the migration tracking table is in place and up to date',
      'Confirm that future database changes can be applied in a controlled, trackable way',
    ]

  if (t.includes('hashing') || t.includes('hash'))
    return [
      'Change your account password in the application and confirm you can log back in with the new password',
      'Confirm the old password no longer works after the change',
    ]

  if (t.includes('security') || t.includes('cleanup') || t.includes('hardcoded') || t.includes('credential'))
    return [
      'Open the application and confirm login and all pages work as expected',
      'Open browser DevTools (F12) and confirm no sensitive values (passwords, keys, connection strings) appear in the Console or Network responses',
    ]

  if (t.includes('fk') || t.includes('foreign key') || t.includes('constraint'))
    return [
      'Confirm the application loads and core data (projects, sites, forms) displays correctly',
      'Confirm that deleting or modifying a parent record behaves as expected without crashing the application',
    ]

  if (t.includes('arcgis') || t.includes('aagis') || t.includes('survey123'))
    return [
      'Log in to the application and confirm you reach the home screen without an ArcGIS login prompt',
      'Confirm all pages load correctly without any ArcGIS-related errors',
    ]

  if (t.includes('worker') || t.includes('management console') || t.includes('batch') || t.includes('scheduler'))
    return [
      'Open the Admin section and confirm the Worker Management console is visible',
      'Confirm the worker list shows current status for each background job',
      'Trigger a manual run and confirm the result is logged correctly',
    ]

  if (t.includes('soft delete') || t.includes('archive') || t.includes('deactivate') || t.includes('cancel'))
    return [
      'Cancel or archive a project and confirm it disappears from the active list',
      'Navigate to the archive or cancelled view and confirm the record appears there',
      'Confirm the record cannot be edited while in an archived or cancelled state',
    ]

  // --- User-facing feature tasks ---

  if (t.includes('pdf') || t.includes('print'))
    return [
      'Open a record and click the PDF or Print button — a file should download or a print dialog should open',
      'Open the file and confirm the correct name, date, and data are present',
      'Confirm nothing is cut off or missing in the layout',
    ]

  if (t.includes('filter') || t.includes('search') || t.includes('pm filter'))
    return [
      'Type in the search or filter field and confirm the list updates to matching results only',
      'Clear the filter and confirm all records return',
      'Search for something that does not exist and confirm an empty or no-results message appears',
    ]

  if (t.includes('upload') || t.includes('import') || t.includes('ingest'))
    return [
      'Click the upload or import button, select a valid file, and confirm it processes without error',
      'Confirm the imported data appears correctly in the list',
      'Try an invalid file type and confirm a clear error message is shown',
    ]

  if (t.includes('map') || t.includes('pipeline'))
    return [
      'Open the map page and confirm it loads with all layers visible',
      'Toggle a layer off and back on and confirm the map updates correctly',
      'Click a feature on the map and confirm the correct details appear',
    ]

  if (t.includes('form') || t.includes('survey') || t.includes('inspection') || t.includes('daily'))
    return [
      'Open the form, fill in all fields, and submit — confirm a success message appears',
      'Re-open the submitted record and confirm the data you entered is shown correctly',
      'Leave a required field blank and try to submit — confirm a validation message appears',
    ]

  if (t.includes('sort') || t.includes('column header'))
    return [
      'Click a column header to sort the list — confirm it reorders correctly',
      'Click the same header again — confirm it sorts in the opposite direction',
      'Scroll through the full list and confirm all records display without errors',
    ]

  if (t.includes('email') || t.includes('notification'))
    return [
      'Trigger the action that sends the email and confirm it arrives in the expected inbox',
      'Confirm the subject line, sender name, and email content are correct',
    ]

  if (t.includes('decimal') || t.includes('quantity'))
    return [
      'Enter a decimal value such as 2.5 in the field and save',
      'Re-open the record and confirm the decimal value is displayed correctly',
      'Confirm the value is not rounded or truncated',
    ]

  if (t.includes('mat sheet') || t.includes('material') || t.includes('rectifier'))
    return [
      'Open the form and confirm all fields are present and accessible',
      'Enter data and save — confirm a success message appears',
      'Re-open the record and confirm the data is displayed correctly',
    ]

  if (t.includes('status') || t.includes('action button') || t.includes('workflow'))
    return [
      'Open a record and confirm the available action buttons match the current status',
      'Click an action button to advance the status and confirm the record updates correctly',
      'Confirm that action buttons for invalid transitions are not shown',
    ]

  if (t.includes('rename') || t.includes('label') || t.includes('client name') || t.includes('add client'))
    return [
      'Open the relevant page and confirm the updated label or field name is displayed correctly',
      'Confirm the change appears consistently across all views where it was present before',
    ]

  if (t.includes('remove') || t.includes('delete') || t.includes('hide'))
    return [
      'Open the relevant page and confirm the removed item or field is no longer visible',
      'Confirm removing it has not caused any errors or broken the layout',
    ]

  if (t.includes('attachment') || t.includes('document') || t.includes('oq') || t.includes('category'))
    return [
      'Open a site or project record and confirm the attachment or document section is visible',
      'Upload a file and confirm it appears under the correct category',
      'Confirm you can open or download the file after uploading',
    ]

  if (t.includes('site') || t.includes('project') || t.includes('region'))
    return [
      'Open the page and confirm all records load and display correctly',
      'Add or edit a record and confirm the change is saved',
      'Confirm the record displays correctly after saving',
    ]

  // Default -- should rarely be reached
  return [
    'Open the relevant page and confirm it loads without errors',
    'Perform the primary action for this task and confirm the result is correct',
    'Confirm the result is still visible after refreshing the page',
  ]
}
