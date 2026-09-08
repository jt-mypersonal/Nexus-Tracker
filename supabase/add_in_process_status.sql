-- NexusIntegrity Tracker -- Add In Process status
-- Run this once in the Supabase SQL Editor (dashboard.supabase.com)
--
-- Distinct from 'blocked' -- represents work that's genuinely partial and
-- may have external dependencies (e.g. T28/OQ Compliance Tracking: several
-- integrations built but not connected, pending client-provided
-- credentials), per the 2026-08-31 Work Summary review. Not counted as
-- "done" for dashboard progress/revenue rollups.
--
-- Full status set: pending | ready | in_process | blocked | uat | complete | invoiced | paid

ALTER TABLE work_items DROP CONSTRAINT IF EXISTS work_items_status_check;

ALTER TABLE work_items ADD CONSTRAINT work_items_status_check
  CHECK (status IN ('pending', 'ready', 'in_process', 'blocked', 'uat', 'complete', 'invoiced', 'paid'));

-- Verify -- should show the new constraint definition
SELECT conname, pg_get_constraintdef(oid)
  FROM pg_constraint
 WHERE conrelid = 'work_items'::regclass AND conname = 'work_items_status_check';
