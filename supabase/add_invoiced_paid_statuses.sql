-- NexusIntegrity Tracker -- Re-add Invoiced/Paid statuses
-- Run this once in the Supabase SQL Editor (dashboard.supabase.com)
--
-- These two statuses existed previously and were collapsed back into
-- 'pending' by migrate_statuses.sql's catch-all. Re-adding them now as a
-- simple, standalone status value (not linked to the separate `invoices`
-- table, which tracks invoices at the category level, not per work item) --
-- this just lets a task move complete -> invoiced -> paid so billing state
-- is visible at a glance without cross-referencing anything else.
--
-- New full status set: pending | ready | blocked | uat | complete | invoiced | paid

ALTER TABLE work_items DROP CONSTRAINT IF EXISTS work_items_status_check;

ALTER TABLE work_items ADD CONSTRAINT work_items_status_check
  CHECK (status IN ('pending', 'ready', 'blocked', 'uat', 'complete', 'invoiced', 'paid'));

-- Verify -- should show the new constraint definition
SELECT conname, pg_get_constraintdef(oid)
  FROM pg_constraint
 WHERE conrelid = 'work_items'::regclass AND conname = 'work_items_status_check';
