-- NexusIntegrity Complimentary Work — Complete Seed
-- Run in Supabase SQL Editor. Clears and re-seeds the nq_items table.
--
-- Scope rule: listed if it CANNOT be associated with a quoted T## line item.
-- This includes bug fixes, performance improvements, field-test iterations,
-- and infrastructure work — none of which were budgeted in any proposal category.
-- "If the topic is covered, the proposal budgeted the feature — not the fixing of it."

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
    SELECT 1 FROM pg_policies
    WHERE tablename = 'nq_items' AND policyname = 'authenticated full access'
  ) THEN
    CREATE POLICY "authenticated full access" ON nq_items
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DELETE FROM nq_items;

INSERT INTO nq_items (id, sort_order, title, description, category, status, delivered_date) VALUES

-- ─────────────────────────────────────────────────────────────────────────────
-- PORTAL — UX & PERFORMANCE
-- None of these improvements were requested or budgeted. They were discovered
-- and delivered because the platform needed them to be professional-grade.
-- ─────────────────────────────────────────────────────────────────────────────

('NQ-P01', 10,
 'Projects table — search, date picker & filter bar redesign',
 'Unified search across all project fields; replaced broken date picker; reorganised filter bar to match a professional SaaS pattern.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P02', 20,
 'Time Reports header — compact single-row layout',
 'Multi-row header was wasting screen space; condensed to single row.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P03', 30,
 'Forms page — unified filter bar',
 'Standalone search merged into filter bar; consistent with the rest of the portal.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P04', 40,
 'Production console log cleanup — 155+ debug statements removed',
 'Every page was logging internal debug data to the browser console, visible to any user who opened DevTools. Scrubbed from all production files.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P05', 50,
 'Form page — sequential API calls converted to parallel fetch',
 'Form pages were loading data sequentially, causing visible multi-second delays. Converted to Promise.all() — immediate render.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P06', 60,
 'Project Manager page — 800ms artificial load delay removed',
 'An artificial 800ms timeout had been added during development and never removed. Eliminated.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P07', 70,
 'Auth context — session verification delay removed on every page load',
 'Every page load was waiting on an unnecessary async session check before rendering. Removed.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P08', 80,
 'Dashboard — pagination controls moved above tables',
 'Pagination was below tables, requiring scroll to change pages. Moved above on all 5 grids.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P09', 90,
 'Dashboard loading spinner removed',
 'A full-screen spinner was blocking the dashboard from rendering. Removed — page now renders immediately.',
 'Portal — UX & Performance', 'delivered', '2026-03-28'),

('NQ-P10', 100,
 'Auth logout — session loop bug and nav-triggered logout fixed',
 'Navigation between pages was incorrectly triggering the logout flow under some conditions.',
 'Portal — UX & Performance', 'delivered', '2026-03-28'),

('NQ-P11', 110,
 'Vite build — stale assets in production (HMR and output path misconfiguration)',
 'Vite outDir did not match .esproj BuildOutputFolder, causing production builds to serve old cached files.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P12', 120,
 'Dashboard home — navigation and KPI card overhaul',
 'Home page toolbar and cards did not match the rest of the portal. Rebuilt to match Projects page style.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P13', 130,
 'System-wide grid layout — all pages fill full viewport height',
 'All 5 main grids had dead white space below content. Multi-pass layout fix to fill the full page.',
 'Portal — UX & Performance', 'delivered', '2026-04-01'),

('NQ-P14', 140,
 'Shared DataGrid component',
 'No reusable table component existed. Built one used across all pages for consistency.',
 'Portal — UX & Performance', 'delivered', '2026-04-01'),

('NQ-P15', 150,
 'Admin pages — comprehensive fix pass',
 'Workers, Materials, Forms, and Sites admin pages had broken delete flows, null crashes, and inconsistent filter bars.',
 'Portal — UX & Performance', 'delivered', '2026-04-01'),

('NQ-P16', 160,
 'Dashboard — status filter toggle added to summary cards',
 'Added All / Scheduled / In Process / Complete toggle so PMs can filter the dashboard to active work.',
 'Portal — UX & Performance', 'delivered', '2026-04-01'),

('NQ-P17', 170,
 'Sites page — search, date picker, and pagination overhaul',
 'Sites page had a broken date picker with UTC off-by-one error, no search, and no consistent pagination.',
 'Portal — UX & Performance', 'delivered', '2026-03-29'),

('NQ-P18', 180,
 'Projects — click-through to detail broken (Swal Promise bug)',
 'Clicking a project row opened a Swal confirmation instead of navigating. Fixed.',
 'Portal — UX & Performance', 'delivered', '2026-04-01'),

('NQ-P19', 190,
 'Archive page — Total Orphaned card clickable to clear filters',
 'The card showed a count but clicking it did nothing. Now clears all filters and shows the orphaned records.',
 'Portal — UX & Performance', 'delivered', '2026-04-01'),

('NQ-P20', 200,
 'Site modal — Labor tab, Equipment tab, maximize button added',
 'Site detail modal was missing tabs for labor and equipment actuals. Added tabs and a maximize button for more screen real estate.',
 'Portal — UX & Performance', 'delivered', '2026-04-26'),

('NQ-P21', 210,
 'Forms management — Draft status excluded from portal view',
 'Draft mobile forms were appearing in the PM portal form list. Excluded from all portal queries and filters.',
 'Portal — UX & Performance', 'delivered', '2026-04-26'),

('NQ-P22', 220,
 'Required Docs tab — renamed from Requirements for clarity',
 'Tab label was confusing in context of the site modal.',
 'Portal — UX & Performance', 'delivered', '2026-04-26'),

-- ─────────────────────────────────────────────────────────────────────────────
-- PORTAL — UNSCOPED NEW FEATURES
-- Features delivered that have no T## line item.
-- ─────────────────────────────────────────────────────────────────────────────

('NQ-F01', 310,
 'Client portal map — Leaflet rewrite (ArcGIS iframe was CORS-blocked)',
 'The ArcGIS embed was blocked by browser security on sandbox. Replaced with a Leaflet-based pipeline viewer.',
 'Portal — New Features', 'delivered', '2026-03-28'),

('NQ-F02', 320,
 'Automated sandbox deploy script',
 'Built deploy-sandbox.ps1: dotnet publish → zip → SCP to EC2 → NSSM restart. One command replaces a multi-step manual RDP process.',
 'Portal — New Features', 'delivered', '2026-04-01'),

('NQ-F03', 330,
 'PM form edit modal — split-panel PDF preview + editable fields',
 'Project Managers can now edit submitted form data directly in the portal without going to the database. Full type validation and silent row refresh. No T## covers this.',
 'Portal — New Features', 'delivered', '2026-04-30'),

('NQ-F04', 340,
 'Sandbox deploy script — S3 storage configuration',
 'S3 bucket, IAM role, and instance profile setup for sandbox photo storage. 71 photos migrated from EC2 disk to S3.',
 'Portal — New Features', 'delivered', '2026-04-25'),

-- ─────────────────────────────────────────────────────────────────────────────
-- DATABASE — FIXES & INFRASTRUCTURE
-- Fixes to data quality issues and infrastructure work not in any T##.
-- ─────────────────────────────────────────────────────────────────────────────

('NQ-D01', 410,
 '35 FK companion indexes added',
 'T05 added FK constraints. A separate audit found 35 FK columns with no index, causing full-table scans on every JOIN. Added all missing indexes.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-04-01'),

('NQ-D02', 420,
 'One Call query — unbounded result set causing timeouts',
 'fn_one_call_sel_list was returning all historical records with no LIMIT. Added cap to prevent dashboard timeouts.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-04-01'),

('NQ-D03', 430,
 'Region deactivation — audit trail recording NULL instead of user identity',
 'The region toggle was writing changed_by = NULL on every change. Fixed to record the logged-in user.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-04-01'),

('NQ-D04', 440,
 'Foreman deduplication — 4 pairs of duplicate employee records',
 'Legacy ArcGIS sync had created 4 pairs of duplicate foreman records. Found and merged. Required to prevent FK violations during migration.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-04-10'),

('NQ-D05', 450,
 'Identity model — employee_id backfill, role constraint, foreman login accounts',
 'usercredentials.employee_id was NULL for most users. Backfilled all records; added role CHECK constraint; seeded 10 foreman login accounts for field crews.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-04-10'),

('NQ-D06', 460,
 'Server-side per-user data scoping',
 'All project, site, and form queries now filtered by the logged-in user''s employee_id. PMs see only their own data. Not in any T##.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-04-10'),

('NQ-D07', 470,
 'Migration 109 — ps_id ambiguous column reference in stored functions',
 'fn_form_reject and fn_form_approve were failing with ambiguous column errors. Fixed.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-04-27'),

('NQ-D08', 480,
 'Migration 110 — work_date and foreman remarks missing from portal queries',
 'Portal form queries were not returning work_date or foreman_remarks. Fixed in stored functions.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-04-27'),

('NQ-D09', 490,
 'Migration 111 — dc_reading column added to NIR',
 'Negative Install Report was missing the DC reading column needed for field data capture.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-04-26'),

('NQ-D10', 500,
 'Migration 116 — Missing One Call date filter lower bound',
 'fn_fetch_missing_one_call had no lower bound on startdate, returning all historical sites as missing. Fixed to show only upcoming.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-05-02'),

('NQ-D11', 510,
 'Migration 108 — NIR CreationDate null causing blank Submitted column in PM Review',
 'PM Review queue showed blank submitted dates for NIR forms due to a null CreationDate. Fixed.',
 'Database — Fixes & Infrastructure', 'delivered', '2026-04-26'),

-- ─────────────────────────────────────────────────────────────────────────────
-- MOBILE — BUG FIXES & FIELD TEST ITERATIONS
-- T41 budgeted the 6 form wizards. Every bug fix and iteration after initial
-- delivery is work the proposal did not budget for.
-- ─────────────────────────────────────────────────────────────────────────────

('NQ-M01', 610,
 'WatermelonDB — O(n²) sync hang on large datasets',
 'Sync was freezing for several minutes on devices with large datasets due to an O(n²) comparison loop. Fixed.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-08'),

('NQ-M02', 620,
 'WatermelonDB — null database crash on cold launch',
 'App was crashing on first launch before the initial sync completed due to a null DB reference.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-08'),

('NQ-M03', 630,
 'WatermelonDB — batch write warning flooding logs',
 'WatermelonDB was emitting hundreds of batch-size warnings per sync cycle.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-15'),

('NQ-M04', 640,
 '401 handler — firing incorrectly on pre-auth and background calls',
 'The 401 interceptor was triggering logout on login, set-password, logout, and background sync calls, causing redirect loops.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-29'),

('NQ-M05', 650,
 'Null materialName crash in JSA steps',
 'JSA form was crashing when catalog materials had a null materialName. Added null guards across all steps.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-27'),

('NQ-M06', 660,
 'Daily form crash — null materialName causing toLowerCase() throw',
 'Daily Report form crashed when materials data included null names from the catalog.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-27'),

('NQ-M07', 670,
 'Drawing canvas — RCTFatal crash hotfix',
 'Drawing form was causing a native RCTFatal crash on certain canvas operations.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-08'),

('NQ-M08', 680,
 'AppState import crash after OTA update',
 'After pushing an OTA update that included weather capture, the app was crashing on load due to a missing AppState import.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-26'),

('NQ-M09', 690,
 'Weather auto-capture — refreshing on every API call instead of every 30 minutes',
 'Weather was being fetched on every form load, not throttled. Fixed to 30-minute intervals from current GPS.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-26'),

('NQ-M10', 700,
 'Weather JSON type mismatch — row_to_json returning object instead of string',
 'Weather data from the server was arriving as a parsed object when the client expected a JSON string. Fixed deserialization.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-26'),

('NQ-M11', 710,
 'Weather missing from PDF renders on all form types',
 'Weather data was captured on-device but not included in PDF render payloads. Fixed for all 6 form types.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-26'),

('NQ-M12', 720,
 'Duplicate daily check — wrong WatermelonDB column name',
 'The one-per-day JSA guard was checking the wrong column name and never firing.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-23'),

('NQ-M13', 730,
 'Duplicate daily check — using created date instead of work date',
 'After fixing the column name, the guard was still checking created_at instead of work_date, allowing duplicates across dates.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-26'),

('NQ-M14', 740,
 'OTA update banner — only checking on mount, missing foreground resume',
 'The OTA update check fired once on app launch but not when the user returned from background, missing updates pushed during the session.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-26'),

('NQ-M15', 750,
 'Outbox timestamps — UTC time displayed as local time (5-hour CDT offset)',
 'Form submission times were shown in UTC, displaying 5 hours early for CDT users.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-15'),

('NQ-M16', 760,
 'Photo server URLs — not persisted to WatermelonDB after sync',
 'After syncing, resolved S3 photo URLs were not written back to local storage, causing photos to re-upload on subsequent syncs.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-16'),

('NQ-M17', 770,
 'AttachmentsSummary — cross-contamination between On Site Log and Photos sections',
 'Photos attached to the On Site Log were appearing in the Photos section and vice versa.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-16'),

('NQ-M18', 780,
 'Labor signature missing from PDF render payload',
 'Labor signatures were captured on-device but stripped from the PDF render request in [id].tsx.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-16'),

('NQ-M19', 790,
 'Equipment list empty when re-opening an existing form',
 'When loading a previously submitted form for editing, the equipment reference data was not being fetched in [id].tsx.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-16'),

('NQ-M20', 800,
 'NIR GPS pre-populate — using wrong field key',
 'NIR pre-populate was using ''gps_coordinates'' but the DB column is ''gps''. GPS field was always blank on new NIR forms.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-24'),

('NQ-M21', 810,
 'JSA checklist — boolean comparison failing on synced string values',
 'After sync, checklist boolean values arrived as strings ("true"/"false"). Comparison was failing, leaving checkboxes unchecked.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-17'),

('NQ-M22', 820,
 'JSA morning-meeting signatures — missing from reloaded forms',
 'Morning meeting signatures were not being restored when loading a previously submitted JSA for review.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-16'),

('NQ-M23', 830,
 'Code review fix pass 1 — map anchor, quantity zero display, FlagBanner, rectifier',
 'Systematic code review found: map pin anchor wrong position, quantity zero showing as blank, FlagBanner state issues, rectifier field cleanup.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-22'),

('NQ-M24', 840,
 'Code review fix pass 2 — parseFloat zero-null bugs, double-update race condition',
 'parseFloat was converting 0 to null, clearing valid zero values. StepDetailsTable had a double-update race on rapid edits.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-22'),

('NQ-M25', 850,
 'Code review fix pass 3 — NaN-in-field bugs across Ground Bed steps',
 'Ground Bed numeric fields were accepting NaN as a valid value when users cleared inputs.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-22'),

('NQ-M26', 860,
 'Comprehensive field test — 7 mobile bugs resolved from first live use',
 'After first field test session: map pins, outbox display, notification parsing, draft preservation, weather injection, drawing UX, photo lightbox all required fixes.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-15'),

('NQ-M27', 870,
 'Ground Bed field test — 8 issues from first field deployment',
 'Ground Bed form: focus loss on numeric fields, numpad keyboard type, placeholder display, matLoaded anti-pattern, pre-pop effects. All found in first field session.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-28'),

('NQ-M28', 880,
 'Offline mode — site docs, local data preservation through logout, sync skip',
 'Site documents were failing when offline. Local form data was being cleared on logout. Sync was throwing errors instead of skipping gracefully.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-29'),

('NQ-M29', 890,
 'NIR — DC negative entry, validation clearing, picker focus, retry limit',
 'NIR form had 4 distinct issues found in field: DC field rejecting negatives, validation not clearing on correction, picker losing focus, retry counter not resetting.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-26'),

('NQ-M30', 900,
 'MULTI_SEP trailing sentinel bug — causing duplicated checklist values',
 'The multi-select separator was producing a trailing sentinel that caused "Slips/trips/falls" to appear twice when forms were reloaded.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-26'),

('NQ-M31', 910,
 'work_date normalization — not restored correctly from all date columns on sync',
 'When syncing forms back from the server, work_date was not being mapped from all possible date column names across form types.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-20'),

('NQ-M32', 920,
 'Mobile sync — On Hold and Cancelled projects and sites excluded',
 'Sync was returning On Hold and Cancelled records to devices. Field techs were seeing inactive sites.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-26'),

('NQ-M33', 930,
 'Drawing canvas — 3 UX fixes from field feedback',
 'Drawing form: compass reset on lightbox close, template size guard, dashed shape rendering.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-27'),

('NQ-M34', 940,
 'Ground Bed drilling log — live update fix, keyboard handling, material sheet integration',
 'Drilling log was not updating in real-time as rows were edited. Keyboard was wrong type on numeric fields.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-28'),

('NQ-M35', 950,
 'Ground Bed — 5 UX fixes from iterative review',
 'Five additional Ground Bed issues resolved after the field test fix pass.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-27'),

('NQ-M36', 960,
 'Pre-TestFlight — comprehensive P0/P1 bug fix pass before App Store submission',
 'Code review before TestFlight submission: map anchor, qty zero, FlagBanner extraction, rectifier cleanup, null pointer guards.',
 'Mobile — Bug Fixes & Iterations', 'delivered', '2026-04-15'),

-- ─────────────────────────────────────────────────────────────────────────────
-- MOBILE — UNSCOPED INFRASTRUCTURE
-- Required to deliver T41 but not individually quoted in any proposal item.
-- ─────────────────────────────────────────────────────────────────────────────

('NQ-I01', 1010,
 'Mobile server API — full sync, form submission, and PDF pipeline (2,700+ lines)',
 'MobileController, MobileSyncService, MobileFormController. The proposal quoted 6 form wizards. The entire server-side API to support them was unquoted.',
 'Mobile — Infrastructure', 'delivered', '2026-04-03'),

('NQ-I02', 1020,
 'Mobile JWT authentication system',
 'T42 replaced web auth. A separate mobile JWT flow (token generation, refresh, session) was needed and built unquoted.',
 'Mobile — Infrastructure', 'delivered', '2026-04-01'),

('NQ-I03', 1030,
 'EAS build pipeline — 6+ build attempts to resolve SDK/Xcode/reanimated conflicts',
 'Getting the first production build required resolving Expo SDK 54, Xcode 16, reanimated v3/v4, Folly, and CocoaPods conflicts across 6 build attempts.',
 'Mobile — Infrastructure', 'delivered', '2026-04-03'),

('NQ-I04', 1040,
 'Form approval workflow — parentFormId versioning, push token registration, Alerts tab',
 'PM approval/rejection flow required: server-side form versioning, Expo push token registration, Alerts tab UI, notification resolution on re-submit.',
 'Mobile — Infrastructure', 'delivered', '2026-04-23'),

('NQ-I05', 1050,
 'Outbox system — retry logic, state management, stuck form detection',
 'The outbox required retry counters, exponential backoff awareness, and Force Retry for permanently stuck forms.',
 'Mobile — Infrastructure', 'delivered', '2026-04-29'),

('NQ-I06', 1060,
 'First-login password setup flow',
 'Production launch required users to set passwords on first login. No passwords could be pre-seeded. Built server + mobile flow.',
 'Mobile — Infrastructure', 'delivered', '2026-04-10'),

('NQ-I07', 1070,
 'Mobile brand refresh — NexHub identity, Montserrat fonts, login URL modal',
 'The Expo template had placeholder branding. Replaced with NexHub colours, typography, and a server URL configuration modal.',
 'Mobile — Infrastructure', 'delivered', '2026-04-08'),

('NQ-I08', 1080,
 'OTA update system — silent download on foreground resume with restart prompt',
 'Production apps need a mechanism to receive updates without App Store review. Built OTA check-on-resume + user prompt.',
 'Mobile — Infrastructure', 'delivered', '2026-04-26'),

('NQ-I09', 1090,
 'Mobile sites map view with PM filter',
 'T21 was the web pipeline map. A mobile sites map pinning active sites scoped to the PM was built separately and unquoted.',
 'Mobile — Infrastructure', 'delivered', '2026-04-15'),

('NQ-I10', 1100,
 'Mobile sync filter — Active projects and Scheduled/In Process sites only',
 'Without this filter, every device received the full historical database. Built to scope sync to operationally relevant records.',
 'Mobile — Infrastructure', 'delivered', '2026-04-26'),

('NQ-I11', 1110,
 'Client Rep field — DB column, API, mobile sync, read-only pre-population',
 'project_site.client_rep did not exist. Added the column, propagated through the server API, synced to mobile, and pre-populated in forms.',
 'Mobile — Infrastructure', 'delivered', '2026-04-29'),

('NQ-I12', 1120,
 '48-hour offline authentication window',
 'Field sites often have no connectivity. Built credential caching so techs can log in and work for up to 48 hours without network.',
 'Mobile — Infrastructure', 'delivered', '2026-04-25'),

-- ─────────────────────────────────────────────────────────────────────────────
-- PDF ENGINE — FIXES & REFINEMENTS
-- T45 budgeted the PDF pipeline. Every bug fix and quality improvement
-- after initial delivery is unbudgeted work.
-- ─────────────────────────────────────────────────────────────────────────────

('NQ-PDF01', 1210,
 'Date timezone — UTC midnight displaying as previous day in CDT (all 6 form types)',
 'Form dates were showing one day early for users in CDT because UTC midnight was being interpreted as the previous calendar day. Fixed across all form tables.',
 'PDF Engine — Fixes', 'delivered', '2026-04-14'),

('NQ-PDF02', 1220,
 'Signature block page break — labels orphaning from signature boxes across all forms',
 'Signature role labels were separating from their boxes at page breaks. Added EnsureSpace to all signature blocks across all 6 form types.',
 'PDF Engine — Fixes', 'delivered', '2026-04-29'),

('NQ-PDF03', 1230,
 'PDF section header padding — excessive whitespace on all forms',
 'Section headers had 8–14pt of unnecessary top padding, wasting page space across all forms. Reduced globally.',
 'PDF Engine — Fixes', 'delivered', '2026-04-29'),

('NQ-PDF04', 1240,
 'Empty job step rows excluded from PDF renders',
 'Blank rows in the job steps table were rendering as empty lines in PDFs.',
 'PDF Engine — Fixes', 'delivered', '2026-05-01'),

('NQ-PDF05', 1250,
 'JSA PDF — Client Rep sourced from wrong database field',
 'Client Rep was reading from client.contactperson (a generic contact) instead of project_site.client_rep (the site-specific rep).',
 'PDF Engine — Fixes', 'delivered', '2026-05-01'),

('NQ-PDF06', 1260,
 'NIR PDF — work_date not routed to report_date field',
 'NIR work dates were not being mapped to the report_date field in the PDF render pipeline.',
 'PDF Engine — Fixes', 'delivered', '2026-04-26'),

('NQ-PDF07', 1270,
 'Drawing form PDF — sketch rendering, weather injection, signature page break',
 'Drawing PDF: sketch was not rendering from drawing_strokes data; weather was missing; signatures orphaned at page break.',
 'PDF Engine — Fixes', 'delivered', '2026-04-27'),

('NQ-PDF08', 1280,
 'Drawing form PDF — group, compass-with-size, and dashed element handling',
 'Three canvas element types were rendering incorrectly or being silently dropped in the PDF.',
 'PDF Engine — Fixes', 'delivered', '2026-04-26'),

('NQ-PDF09', 1290,
 'Drawing form — first photo rendered as sketch when drawing_strokes is absent',
 'Drawing forms submitted before the canvas feature was added have no strokes. Falls back to first photo as the sketch image.',
 'PDF Engine — Fixes', 'delivered', '2026-05-01'),

('NQ-PDF10', 1300,
 'Rectifier PDF — GPS coordinates not mapped from site columns',
 'Rectifier PDF had no GPS data because site_lat/site_long were not being included in the render payload.',
 'PDF Engine — Fixes', 'delivered', '2026-05-01'),

('NQ-PDF11', 1310,
 'Ground bed drilling log — anode_depth field never wired to PDF',
 'The anode_depth column existed in the database but was not mapped to AnodeDepth in the PDF model.',
 'PDF Engine — Fixes', 'delivered', '2026-05-01'),

('NQ-PDF12', 1320,
 'Ground bed PDF — MatStr crash on numeric JSON values',
 'PDF renderer was crashing when material string fields contained numeric JSON values instead of strings.',
 'PDF Engine — Fixes', 'delivered', '2026-04-28'),

('NQ-PDF13', 1330,
 'Ground bed PDF — unsafe depth_col::float cast',
 'A ::float cast on the depth column was failing when the column contained non-numeric data.',
 'PDF Engine — Fixes', 'delivered', '2026-04-28'),

('NQ-PDF14', 1340,
 'Ground bed PDF — data loss on rapid sequential edits',
 'Rapid saves to ground bed data were causing earlier edits to be overwritten due to a race condition in the query pipeline.',
 'PDF Engine — Fixes', 'delivered', '2026-04-28'),

('NQ-PDF15', 1350,
 'Ground bed PDF — JsonDocument lifetime bug causing random crashes',
 'QuestPDF was reading from a JsonDocument after it had been disposed, causing non-deterministic crashes.',
 'PDF Engine — Fixes', 'delivered', '2026-04-30'),

('NQ-PDF16', 1360,
 'Ground bed PDF — PdfDec null guard crash',
 'PdfDec helper was being called with a null material value, crashing the renderer.',
 'PDF Engine — Fixes', 'delivered', '2026-04-30'),

('NQ-PDF17', 1370,
 'Ground bed schematic — 5 layout and scaling fix passes',
 'Schematic had: incorrect topA/botA ordering, clipping at top and bottom, wrong content width constant, casing_txt=0 not falling back to material sheet, PVC casing label overlap. Required 5 separate fix passes.',
 'PDF Engine — Fixes', 'delivered', '2026-04-29'),

('NQ-PDF18', 1380,
 'Weather banner — added to all 6 form PDFs',
 'Weather conditions were captured on mobile but not appearing on any portal-generated PDF. Added weather banner to all form types.',
 'PDF Engine — Fixes', 'delivered', '2026-04-26'),

('NQ-PDF19', 1390,
 'NIR PDF — weather pulled from DB when mobile payload missing',
 'NIR forms submitted before the weather feature was added had no weather in the payload. Server now falls back to DB lookup.',
 'PDF Engine — Fixes', 'delivered', '2026-04-26'),

('NQ-PDF20', 1400,
 'Ground bed form submit — two type mismatch 500 errors',
 'Ground bed form submission was failing with server 500 errors due to type mismatches between mobile payload and stored function parameters.',
 'PDF Engine — Fixes', 'delivered', '2026-04-28'),

-- ─────────────────────────────────────────────────────────────────────────────
-- HISTORICAL SURVEY123 DATA MIGRATION
-- The proposal covers departing Survey123 going forward (T41).
-- Migrating the historical archive of existing data was never quoted.
-- ─────────────────────────────────────────────────────────────────────────────

('NQ-H01', 1510,
 'MigrationTool — custom .NET CLI migration runner',
 'No tool existed for running the production migration. Built a custom .NET command-line tool supporting schema, sub-table import, drawing-gap, and photo migration commands. Fully idempotent.',
 'Historical Data Migration', 'delivered', '2026-04-30'),

('NQ-H02', 1520,
 'Sub-table import — 35,188 rows across 10 Survey123 sub-table types',
 'Personnel lists, job steps, labor info, materials, equipment, drilling logs, anode output, anode connections, details, and rental records. All queried from ArcGIS Feature Services and imported.',
 'Historical Data Migration', 'delivered', '2026-05-01'),

('NQ-H03', 1530,
 'Photo migration — 7,494 photos and signatures from ArcGIS to S3',
 'All historical form photos and signatures were stored in ArcGIS. Downloaded and uploaded to nexhub-storage-prodsandbox S3. attachments_json populated on 1,809 forms so PDFs render with photos.',
 'Historical Data Migration', 'delivered', '2026-05-01'),

('NQ-H04', 1540,
 'Drawing form gap import — 8 forms found only in Survey123',
 'Drawing forms existed in Survey123 that had no corresponding record in the nexhub database. Identified and imported.',
 'Historical Data Migration', 'delivered', '2026-05-01'),

('NQ-H05', 1550,
 'Survey123 import idempotency — globalid columns on 10 sub-tables',
 'Without unique identifiers, re-running the importer would duplicate all sub-table rows. Added globalid column with partial unique indexes to all 10 tables.',
 'Historical Data Migration', 'delivered', '2026-05-01'),

('NQ-H06', 1560,
 'PostgreSQL keepalive fix during photo migration',
 'AWS Client VPN idle timeout (10 min) was closing DB TCP connections silently during the ArcGIS fetch phase, causing DB operations to hang indefinitely. Fixed with Npgsql keepalive and background ping.',
 'Historical Data Migration', 'delivered', '2026-05-01'),

('NQ-H07', 1570,
 'Production form count anomaly — 611 ghost records at status=0/NULL',
 'Found 611 production forms invisible in the UI because the Form page JOINs form_status and these records had no valid status. Legacy batch-task inserts with no field data. Patched migration to discard them.',
 'Historical Data Migration', 'delivered', '2026-05-02'),

-- ─────────────────────────────────────────────────────────────────────────────
-- PRODUCTION MIGRATION & DEPLOYMENT
-- T39 (AWS Prod Setup) was in the proposal but blocked from day one.
-- The actual migration work was scoped, executed, and delivered unquoted.
-- ─────────────────────────────────────────────────────────────────────────────

('NQ-G01', 1610,
 'Prodsandbox dry run — 2-day full production migration rehearsal',
 'Restored production backup to a separate EC2/RDS environment and executed every migration phase end-to-end. Found and fixed 12 issues. 52/52 smoke tests passing before sign-off.',
 'Production Migration', 'delivered', '2026-05-02'),

('NQ-G02', 1620,
 'Production deployment runbook',
 'Phase-by-phase production runbook: vendor task deletion, schema migration, IIS vs NSSM host detection, dual-path deploy scripts, S3 credential configuration, DNS cutover procedure, mobile OTA steps, and rollback plan.',
 'Production Migration', 'delivered', '2026-05-04'),

('NQ-G03', 1630,
 'Vendor batch task discovery — 38 PROD_BAT_NEXUS_* tasks, 2 actively running',
 'Discovered 38 undocumented Windows Task Scheduler tasks performing bi-directional ArcGIS↔PostgreSQL sync on all EC2 instances. Two were active. Running during migration would have corrupted both systems. Built automated deletion script.',
 'Production Migration', 'delivered', '2026-05-01'),

('NQ-G04', 1640,
 'IIS vs NSSM detection — dual-path deploy scripts for unknown production hosting',
 'Production EC2 hosting method was unknown. Built detection script and separate deploy scripts for both IIS and NSSM so the runbook works regardless.',
 'Production Migration', 'delivered', '2026-05-04'),

('NQ-G05', 1650,
 'PM role seeding — all PM/Admin accounts had role=NULL',
 'Discovered during dry run that all PM and Admin accounts had role=NULL in the production database, causing PM Review Queue to appear empty. Fixed in migration 113.',
 'Production Migration', 'delivered', '2026-05-01'),

('NQ-G06', 1660,
 'Archive trigger rebuild — linked_form_archive_id never populated',
 'The archive attachment trigger was not populating linked_form_archive_id, leaving 289 legacy archive records orphaned. Rebuilt in migration 115.',
 'Production Migration', 'delivered', '2026-05-01'),

('NQ-G07', 1670,
 'Production smoke test suite — 52 automated checks',
 'Built a 52-check automated smoke test suite covering schema completeness, sub-table row counts, role seeding, photo attachment counts, and form status distribution. Runs against any environment.',
 'Production Migration', 'delivered', '2026-05-02');

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT category, COUNT(*) AS items
FROM nq_items WHERE status = 'delivered'
GROUP BY category ORDER BY MIN(sort_order);

SELECT COUNT(*) AS total FROM nq_items WHERE status = 'delivered';
