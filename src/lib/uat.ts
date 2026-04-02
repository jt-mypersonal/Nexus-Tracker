// Generates 3-4 plain end-user UAT steps based on the work item
export function generateUatItems(title: string, notes: string | null): string[] {
  const t = (title + ' ' + (notes || '')).toLowerCase()

  if (t.includes('login') || t.includes('sign in') || t.includes('auth') || t.includes('password'))
    return [
      'Go to the login page and sign in with your username and password — you should land on the home screen',
      'Refresh the page — you should still be logged in',
      'Click Logout — you should be returned to the login screen',
    ]

  if (t.includes('pdf') || t.includes('print'))
    return [
      'Open a record and click the PDF or Print button — a file should download or a print dialog should open',
      'Open the file and confirm the correct name, date, and data are present',
      'Confirm nothing is cut off or missing in the layout',
    ]

  if (t.includes('filter') || t.includes('search'))
    return [
      'Type in the search or filter field and confirm the list updates to matching results only',
      'Clear the filter and confirm all records return',
      'Search for something that does not exist and confirm an empty message appears',
    ]

  if (t.includes('upload') || t.includes('import'))
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

  if (t.includes('delete') || t.includes('deactivate') || t.includes('archive') || t.includes('remove'))
    return [
      'Delete or deactivate a record and confirm it no longer appears in the active list',
      'Confirm a prompt appears asking you to confirm before anything is deleted',
    ]

  if (t.includes('sort') || t.includes('sortable') || t.includes('column header'))
    return [
      'Click a column header to sort the list — confirm it reorders correctly',
      'Click the same header again — confirm it sorts in the opposite direction',
      'Scroll through the full list and confirm all records load without errors',
    ]

  if (t.includes('email') || t.includes('notification'))
    return [
      'Trigger the action and confirm the email arrives in your inbox',
      'Confirm the subject, sender name, and content are correct',
    ]

  if (t.includes('decimal') || t.includes('quantity') || t.includes('hours'))
    return [
      'Enter a decimal value such as 2.5 in the field and save',
      'Re-open the record and confirm the decimal value is displayed correctly',
    ]

  if (t.includes('mat sheet') || t.includes('material') || t.includes('rectifier'))
    return [
      'Open the form and confirm all fields are present and accessible',
      'Enter data and save — confirm a success message appears',
      'Re-open the record and confirm the data is displayed correctly',
    ]

  if (t.includes('site') || t.includes('project') || t.includes('region'))
    return [
      'Open the page and confirm all records load and display correctly',
      'Add a new record, fill in all fields, and save — confirm it appears in the list',
      'Open the record and confirm all the information you entered is correct',
    ]

  // Default
  return [
    'Open the relevant page and confirm it loads without errors',
    'Perform the main action for this task and confirm the result is correct',
    'Confirm the change is saved and visible when you return to the page',
  ]
}
