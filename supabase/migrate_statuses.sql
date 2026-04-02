-- NexusIntegrity Tracker -- Status Migration
-- Run this once in the Supabase SQL Editor (dashboard.supabase.com)
-- New status set: pending | ready | blocked | uat | complete

-- Step 1: Drop the old check constraint
ALTER TABLE work_items DROP CONSTRAINT IF EXISTS work_items_status_check;

-- Step 2: Migrate records

-- UAT: all items fully delivered from our side
UPDATE work_items SET status = 'uat'
  WHERE status = 'complete'
     OR id IN ('T06', 'T18');

-- BLOCKED: waiting on client input, credentials, server access, or hard prerequisites
UPDATE work_items SET status = 'blocked'
  WHERE id IN (
    'T22',  -- Site Upload: pending client answer on Estimated flag default
    'T24',  -- One Call FTP: needs FTP credentials + sample file from client
    'T25',  -- Copy/Paste Grids: pending scope confirmation from client
    'T26',  -- Materials Email: needs client to confirm email template format
    'T27',  -- Documents Email: pending document types + recipient field from client
    'T28',  -- OQ Compliance: needs API credentials (ISN/Avetta/Veriforce/DISA)
    'T29',  -- Add Work Types: needs hard copy form samples from client
    'T30',  -- Smartsheets: needs Smartsheets dev API credentials
    'T31',  -- Customer Portal: needs complete spec from Sydney
    'T32',  -- Sites Map: needs materials provider data source + facility type codes
    'T33',  -- Cost Build Form: needs Excel workbook from client
    'T34',  -- Medical Facility Filter: needs facility type code list
    'T36',  -- Site Pre-population: needs field mapping markup from Nexus
    'T39',  -- AWS Prod Setup: needs RDP/SSH access to production EC2 from client
    'T41'   -- iPad App: needs iPad device + Apple Enterprise enrollment + form samples
  );

-- READY: can proceed now, no client dependency
UPDATE work_items SET status = 'ready' WHERE id = 'T05';

-- Catch-all: any remaining open/in_progress -> pending
UPDATE work_items SET status = 'pending'
  WHERE status IN ('open', 'in_progress', 'invoiced', 'paid');

-- Step 3: Add new check constraint
ALTER TABLE work_items ADD CONSTRAINT work_items_status_check
  CHECK (status IN ('pending', 'ready', 'blocked', 'uat', 'complete'));

-- Verify -- should show no rows
SELECT id, title, status FROM work_items
  WHERE status NOT IN ('pending', 'ready', 'blocked', 'uat', 'complete')
  ORDER BY id;

-- Review final state
SELECT id, title, status FROM work_items ORDER BY id;
