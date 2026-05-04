-- NexusIntegrity Complimentary Work — Corrected Seed
-- Run in Supabase SQL Editor (dashboard.supabase.com)
--
-- Scope rule: ONLY work that has no corresponding T## proposal category.
-- Re-work or depth within a scoped category (T41 mobile, T45 PDF, T20 workers,
-- Cat 1-2 items, etc.) is NOT listed here regardless of effort. This list is
-- for work we did to improve the system that was never in any line item.

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS nq_items (
  id             text primary key,
  sort_order     integer not null default 0,
  title          text not null,
  description    text not null default '',
  category       text not null,
  status         text not null default 'delivered'
                 check (status in ('delivered','in_progress','suggested','escalated')),
  delivered_date date,
  est_hrs_lo     numeric(6,1),
  est_hrs_hi     numeric(6,1),
  est_value_lo   numeric(10,2),
  est_value_hi   numeric(10,2)
);

ALTER TABLE nq_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'nq_items' AND policyname = 'authenticated full access'
  ) THEN
    CREATE POLICY "authenticated full access" ON nq_items
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Clear existing rows before re-seed
DELETE FROM nq_items;

-- ── Seed ─────────────────────────────────────────────────────────────────────

INSERT INTO nq_items (id, sort_order, title, description, category, status, delivered_date) VALUES

-- ── PORTAL: UX & PERFORMANCE ─────────────────────────────────────────────────
-- None of the portal UX improvements were T## line items. They were identified
-- and delivered during the engagement to make the platform usable.

('NQ-01',  10,
 'ProjectsTable — Unified Search, Date Picker & Filter Bar',
 'Rebuilt search, added multi-field filter bar, replaced broken date picker, fixed UTC off-by-one on date range queries.',
 'Portal / UX', 'delivered', '2026-03-29'),

('NQ-02',  20,
 'TimeReportHeader — Compact Single-Row Layout',
 'Condensed multi-row time report header into a single responsive row.',
 'Portal / UX', 'delivered', '2026-03-29'),

('NQ-03',  30,
 'Forms Page — Unified Filter Bar',
 'Merged standalone search into filter bar, consistent with Projects page.',
 'Portal / UX', 'delivered', '2026-03-29'),

('NQ-04',  40,
 'Frontend Console Log Cleanup',
 'Removed 155+ dev debug statements from all production files. Previously visible to any user who opened browser DevTools.',
 'Portal / UX', 'delivered', '2026-03-29'),

('NQ-05',  50,
 'Performance — Parallelised Form Fetches & Removed Artificial Delays',
 'Converted sequential form page API calls to Promise.all(). Removed 800ms delay on Project Manager page and auth context boot delay.',
 'Portal / UX', 'delivered', '2026-03-29'),

('NQ-06',  60,
 'Dashboard — Pagination Controls Repositioned',
 'Moved per-table pagination above the data tables on all 5 dashboard grids.',
 'Portal / UX', 'delivered', '2026-03-29'),

('NQ-07',  70,
 'Loading Spinner Stability',
 'Fixed full-screen spinner during page transitions; removed dashboard spinner that was blocking immediate render.',
 'Portal / UX', 'delivered', '2026-03-28'),

('NQ-08',  80,
 'Auth Logout Stability — Session Bug & Nav-Triggered Logout Fix',
 'Fixed auth loop re-triggering logout during navigation; stabilised session cleanup.',
 'Portal / UX', 'delivered', '2026-03-28'),

('NQ-09',  90,
 'Vite Build Configuration — HMR & Output Path Fix',
 'Fixed mismatched Vite outDir vs .esproj BuildOutputFolder causing stale assets in production builds.',
 'Portal / UX', 'delivered', '2026-03-29'),

('NQ-10',  100,
 'Dashboard Home — Navigation & Card Layout Overhaul',
 'Rebuilt home KPI cards, toolbar, and nav items to match the Projects page style. Fixed card bottom padding and minHeight.',
 'Portal / UX', 'delivered', '2026-03-29'),

('NQ-11',  110,
 'System-Wide Grid Layout — Full-Page Fill',
 'Multi-pass layout fix ensuring all 5 main grids fill the full viewport height with no dead white space.',
 'Portal / UX', 'delivered', '2026-04-01'),

('NQ-12',  120,
 'Shared DataGrid Component',
 'Extracted reusable DataGrid with consistent columns, sorting, and pagination across all portal pages.',
 'Portal / UX', 'delivered', '2026-04-01'),

('NQ-13',  130,
 'Admin Pages — Comprehensive Fix Pass',
 'Fixed Workers, Materials, Forms, and Sites admin pages: broken delete flows, null crashes, filter bar consistency.',
 'Portal / UX', 'delivered', '2026-04-01'),

('NQ-14',  140,
 'Dashboard — Status Filter for Summary Cards',
 'Added status toggle (All / Scheduled / In Process / Complete) to dashboard summary cards.',
 'Portal / UX', 'delivered', '2026-04-01'),

('NQ-15',  150,
 'Client Portal Map — Leaflet Rewrite',
 'ArcGIS map iframe blocked by CORS on sandbox. Replaced with a Leaflet pipeline viewer. Not the same scope as T21 (web pipeline map page) — this is the embedded client portal view.',
 'Portal / UX', 'delivered', '2026-03-28'),

('NQ-16',  160,
 'Automated Sandbox Deploy Script',
 'Built deploy-sandbox.ps1: dotnet publish → zip → SCP → NSSM restart in one command. Eliminated manual RDP deployments.',
 'Portal / UX', 'delivered', '2026-04-01'),

('NQ-17',  170,
 'PM Form Edit Modal',
 'Project Managers can edit submitted form data in the portal: split-panel modal with live PDF preview and editable fields. Full type validation and cascaded save. Not in any proposal category.',
 'Portal / UX', 'delivered', '2026-04-30'),

-- ── DATABASE & INFRASTRUCTURE ─────────────────────────────────────────────────
-- T05 added FK constraints. The companion indexes, query fixes, and identity
-- model work below are separate — T05 did not cover these.

('NQ-18',  210,
 '35 FK Companion Indexes',
 'T05 added FK constraints. Separately identified and added 35 missing indexes on FK columns. Eliminates full-table scans on every JOIN across core tables.',
 'Database / Infrastructure', 'delivered', '2026-04-01'),

('NQ-19',  220,
 'One Call Query — Unbounded Result Cap',
 'fn_one_call_sel_list returned all historical records with no limit, causing dashboard timeouts on large datasets.',
 'Database / Infrastructure', 'delivered', '2026-04-01'),

('NQ-20',  230,
 'Region Deactivation — Audit Identity Fix',
 'Region toggle was recording changed_by = NULL. Wired logged-in user identity to the audit trail.',
 'Database / Infrastructure', 'delivered', '2026-04-01'),

('NQ-21',  240,
 'Identity Model — Foreman Deduplication',
 'Found and merged 4 pairs of duplicate foreman records created by legacy ArcGIS sync. Required to avoid FK violations during migration.',
 'Database / Infrastructure', 'delivered', '2026-04-10'),

('NQ-22',  250,
 'Identity Model — Employee ID Backfill, Role Constraint & Foreman Accounts',
 'Backfilled usercredentials.employee_id for all users; added role CHECK constraint; seeded 10 foreman login accounts for field crews.',
 'Database / Infrastructure', 'delivered', '2026-04-10'),

('NQ-23',  260,
 'Server-Side Per-User Data Scoping',
 'All project, site, and form queries now filtered server-side by the logged-in user''s employee_id. Prevents PMs seeing each other''s data. Not in any T## scope.',
 'Database / Infrastructure', 'delivered', '2026-04-10'),

('NQ-24',  270,
 'Survey123 Import Idempotency — globalid on 10 Sub-Tables',
 'Added globalid column with partial unique indexes to all 10 Survey123 sub-tables. Allows safe re-runs of the data importer without duplicates.',
 'Database / Infrastructure', 'delivered', '2026-04-30'),

-- ── MOBILE: BEYOND T41 SCOPE ──────────────────────────────────────────────────
-- T41 scoped 6 form types, offline sync, GPS, and push notifications.
-- The items below were identified during delivery and are genuinely outside that.

('NQ-25',  310,
 'First-Login Password Setup Flow',
 'Users with no stored password are prompted to set one on first login. Required for production cutover so no passwords need to be pre-seeded. Not scoped in T41 or T42.',
 'Mobile', 'delivered', '2026-04-10'),

('NQ-26',  320,
 'Mobile Sites Map View with PM Filter',
 'Map view on the Sites screen showing active sites as pins, scoped to the logged-in PM''s assignments. T21 was the web pipeline map — this mobile map is separate.',
 'Mobile', 'delivered', '2026-04-15'),

('NQ-27',  330,
 'OTA Update Banner',
 'App silently downloads OTA updates on foreground resume and prompts for restart. Not a T41 deliverable.',
 'Mobile', 'delivered', '2026-04-29'),

('NQ-28',  340,
 'Mobile Sync Filter — Active Projects & Scheduled/In Process Sites Only',
 'Sync returns only operationally relevant records. Reduces noise for field techs and prevents completed historical data from appearing on devices.',
 'Mobile', 'delivered', '2026-04-30'),

('NQ-29',  350,
 'Client Rep Field — Full Stack',
 'Added project_site.client_rep column, wired through the server API, synced to mobile, and pre-populated read-only in forms. Not in T41 or any other scope item.',
 'Mobile', 'delivered', '2026-04-29'),

-- ── MATERIAL SHEET ────────────────────────────────────────────────────────────
-- The material sheet is a new feature with no T## equivalent.
-- It sits alongside the ground bed form but is a separate planning/tracking system.

('NQ-30',  410,
 'Material Sheet — Schema & Ground Bed Configuration',
 'New DB table (site_material_sheet) with columns for coke type/container, anode specs, casing depth, vent type, borehole dimensions, and work type. Not in any proposal category.',
 'Material Sheet', 'delivered', '2026-04-22'),

('NQ-31',  420,
 'Material Sheet — Auto-Calculations',
 'Three live calculations derived from form data: borehole volume (π·r²·depth), coke bag count (volume × density ÷ bag weight), vent pipe length (D − B + 1).',
 'Material Sheet', 'delivered', '2026-04-22'),

('NQ-32',  430,
 'Material Sheet — Lifecycle Management',
 'Draft → Complete lifecycle with version tracking. Completing snapshots the sheet; subsequent edits create new versions. Missing-field validation on Mark Complete.',
 'Material Sheet', 'delivered', '2026-04-23'),

('NQ-33',  440,
 'Material Sheet — Mobile API',
 'Mobile app reads planned values from the material sheet and writes actuals back from the field. Ground Bed form pre-populates planning fields from sheet.',
 'Material Sheet', 'delivered', '2026-04-25'),

('NQ-34',  450,
 'Material Sheet — Portal UI',
 '8-section collapsible accordion (Borehole, Anode System, Fill Materials, Cement/Plug, Surface & Vent, Wiring, Site Items, Notes), KPI summary cards, fixed header, jump-to navigation, and planned vs actual column layout.',
 'Material Sheet', 'delivered', '2026-05-04'),

-- ── PRODUCTION MIGRATION ──────────────────────────────────────────────────────
-- T39 (AWS Prod Setup) was listed as BLOCKED pending client access. The migration
-- work below was delivered entirely unscoped.

('NQ-35',  510,
 'MigrationTool — Custom .NET Migration Runner',
 'Built a custom .NET CLI tool for idempotent SQL migration execution against PostgreSQL. Supports schema, sub-table import, drawing-gap, and photo migration commands.',
 'Production Migration', 'delivered', '2026-04-30'),

('NQ-36',  520,
 'Prodsandbox Dry Run — Full Production Migration Rehearsal',
 '2-day rehearsal against a restored production database copy: 115 schema migrations, Survey123 sub-table import (35,188 rows), photo migration (5,827 to S3). 12 bugs found and fixed. 52/52 smoke tests passing before sign-off.',
 'Production Migration', 'delivered', '2026-05-02'),

('NQ-37',  530,
 'Production Deployment Runbook',
 'Phase-by-phase runbook: vendor task deletion, schema migration, IIS vs NSSM host detection and dual-path deploy scripts, S3 credential config, DNS cutover, mobile OTA steps, and rollback plan.',
 'Production Migration', 'delivered', '2026-05-04'),

('NQ-38',  540,
 'Vendor Batch Task Discovery & Deletion Script',
 'Discovered 38 undocumented Windows Task Scheduler tasks (PROD_BAT_NEXUS_*) running bi-directional ArcGIS↔PostgreSQL sync on all EC2 instances — 2 were actively running at time of discovery. Running during migration would have corrupted both systems. Built automated deletion script.',
 'Production Migration', 'delivered', '2026-05-01'),

('NQ-39',  550,
 'Production Form Count Anomaly — 611 Ghost Records',
 'Identified 611 production forms at status=0 or NULL that were invisible in the UI due to a JOIN on form_status. Legacy batch task inserts with no field data. Fixed migration to discard them and prevent inflated counts after cutover.',
 'Production Migration', 'delivered', '2026-05-02');

-- ── Verify ───────────────────────────────────────────────────────────────────
SELECT category, COUNT(*) as items
FROM nq_items
WHERE status = 'delivered'
GROUP BY category
ORDER BY category;

SELECT COUNT(*) as total_delivered FROM nq_items WHERE status = 'delivered';
