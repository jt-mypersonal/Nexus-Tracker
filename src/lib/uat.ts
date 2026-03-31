// Auto-generates end-user UAT checklist items based on work item title/content
export function generateUatItems(title: string, notes: string | null): string[] {
  const t = (title + ' ' + (notes || '')).toLowerCase()
  const items: string[] = []

  if (t.includes('login') || t.includes('auth') || t.includes('password') || t.includes('sign in'))
    items.push(
      'Enter your username and password and click Sign In — you should land on the home page',
      'Refresh the page — you should remain logged in',
      'Click your name in the sidebar, then click Logout — you should be taken back to the login screen',
      'After logging out, try navigating to a page directly — it should redirect you back to login',
    )

  if (t.includes('filter') || t.includes('search'))
    items.push(
      'Type in the search box and confirm the list updates to show matching results',
      'Clear the search box and confirm all results return',
      'Search for something that does not exist and confirm an empty state message appears',
    )

  if (t.includes('pdf') || t.includes('print') || t.includes('report'))
    items.push(
      'Open a record and click the PDF or Print button — a file should download or a print dialog should open',
      'Open the PDF and confirm the correct project name, date, and data appear',
      'Confirm the layout looks clean with no cut-off fields or missing sections',
    )

  if (t.includes('upload') || t.includes('import'))
    items.push(
      'Click the upload or import button and select a valid file — confirm it processes without error',
      'Confirm the imported data appears in the list or grid after upload',
      'Try uploading an invalid file type and confirm a clear error message is shown',
    )

  if (t.includes('email') || t.includes('notification'))
    items.push(
      'Trigger the action that sends a notification and confirm the email arrives in your inbox',
      'Confirm the email subject, sender, and content are correct',
    )

  if (t.includes('map') || t.includes('pipeline') || t.includes('layer'))
    items.push(
      'Open the map page and confirm it loads with all layers visible',
      'Toggle each layer on and off and confirm the map updates correctly',
      'Click on a feature on the map and confirm the correct information appears',
    )

  if (t.includes('form') || t.includes('modal') || t.includes('input') || t.includes('survey'))
    items.push(
      'Open the form and fill in all fields, then save — confirm the record appears in the list',
      'Leave a required field blank and try to save — confirm a validation message appears',
      'Open a saved record and confirm the data you entered is displayed correctly',
    )

  if (t.includes('sort') || t.includes('grid') || t.includes('table') || t.includes('list'))
    items.push(
      'Click a column header to sort — confirm the list reorders correctly',
      'Click the same column header again — confirm it sorts in the opposite direction',
      'Scroll through the list and confirm all records load without errors',
    )

  if (t.includes('delete') || t.includes('deactivate') || t.includes('remove') || t.includes('archive'))
    items.push(
      'Delete or deactivate a record and confirm it no longer appears in the active list',
      'Confirm a confirmation prompt appears before the record is deleted',
    )

  if (t.includes('decimal') || t.includes('quantity') || t.includes('hours') || t.includes('numeric'))
    items.push(
      'Enter a decimal value (e.g. 2.5) in the field and save — confirm it saves correctly',
      'Re-open the record and confirm the decimal value is displayed as entered',
    )

  if (t.includes('site') || t.includes('project') || t.includes('region'))
    items.push(
      'Open the relevant page and confirm all records load and display correctly',
      'Add a new record, fill in all fields, and save — confirm it appears in the list',
      'Click on a record to open its detail view — confirm all information is correct',
    )

  if (t.includes('calendar') || t.includes('date') || t.includes('schedule'))
    items.push(
      'Select a date from the date picker and confirm it saves correctly',
      'Re-open the record and confirm the correct date is shown',
    )

  if (t.includes('excel') || t.includes('mat sheet') || t.includes('material'))
    items.push(
      'Open the material sheet or form and confirm all fields are present',
      'Enter data and save — confirm the record saves without error',
      'Confirm the data appears correctly when you re-open the record',
    )

  if (t.includes('rectifier') || t.includes('daily') || t.includes('inspection'))
    items.push(
      'Open the form and confirm all sections are present and accessible',
      'Fill in the form fields and submit — confirm a success message appears',
      'Confirm the submitted record appears in the project or site history',
    )

  // Default fallback
  if (items.length === 0)
    items.push(
      'Open the relevant page or feature and confirm it loads without errors',
      'Perform the main action described in the task and confirm it works as expected',
      'Confirm the result is saved and visible after completing the action',
      'Test on sandbox before signing off',
    )

  // Always add
  items.push('Tested on sandbox and confirmed working')

  return [...new Set(items)]
}
