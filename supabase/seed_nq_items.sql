-- NexusIntegrity Complimentary Work — Complete Seed
-- Run in Supabase SQL Editor (dashboard.supabase.com)
-- Creates the nq_items table and seeds all delivered complimentary work
-- All items represent work delivered outside the Phase 2 proposal scope at no charge.

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

-- ── Seed ─────────────────────────────────────────────────────────────────────

INSERT INTO nq_items (id, sort_order, title, description, category, status, delivered_date, est_hrs_lo, est_hrs_hi, est_value_lo, est_value_hi) VALUES

-- ── PORTAL: UX & PERFORMANCE ─────────────────────────────────────────────────
('NQ-01',  10,  'ProjectsTable — Unified Search, Date Picker & Filter Bar',
 'Rebuilt search, added multi-field filter bar, replaced broken date picker with working component, fixed UTC off-by-one on date range queries.',
 'Portal / UX', 'delivered', '2026-03-29', 3.0, 4.0, 375.00, 500.00),

('NQ-02',  20,  'TimeReportHeader — Compact Single-Row Layout',
 'Condensed multi-row time report header into a single responsive row; eliminated wasted vertical space.',
 'Portal / UX', 'delivered', '2026-03-29', 1.0, 1.0, 125.00, 125.00),

('NQ-03',  30,  'Forms Page — Search Consolidated into Filter Bar',
 'Merged standalone search box into unified filter bar, matching Projects page pattern.',
 'Portal / UX', 'delivered', '2026-03-29', 1.0, 1.5, 125.00, 188.00),

('NQ-04',  40,  'Frontend Console Log Cleanup',
 'Removed 155+ dev debug console.log statements from all production build files; eliminated client-visible noise in browser DevTools.',
 'Portal / UX', 'delivered', '2026-03-29', 1.5, 2.0, 188.00, 250.00),

('NQ-05',  50,  'Performance: Parallelised Form Fetches & Removed Artificial Delays',
 'Converted sequential form page API calls to Promise.all(); removed 800ms artificial delay on Project Manager page; removed auth context verification delay on boot.',
 'Portal / UX', 'delivered', '2026-03-29', 1.5, 2.0, 188.00, 250.00),

('NQ-06',  60,  'Dashboard — Pagination Controls Moved Above Tables',
 'Repositioned per-table pagination above the data tables on all 5 dashboard grids for accessibility.',
 'Portal / UX', 'delivered', '2026-03-29', 0.5, 0.5, 63.00, 63.00),

('NQ-07',  70,  'Loading Spinner — Full-Screen Stability & Page Transition Fix',
 'Fixed full-screen spinner rendering during page transitions; removed dashboard loading spinner that blocked immediate page render.',
 'Portal / UX', 'delivered', '2026-03-28', 1.0, 1.0, 125.00, 125.00),

('NQ-08',  80,  'Auth Logout Stability — Session Bug & Nav-Triggered Logout Fix',
 'Fixed auth loop that re-triggered logout during navigation; stabilised session cleanup on explicit logout.',
 'Portal / UX', 'delivered', '2026-03-28', 1.0, 1.5, 125.00, 188.00),

('NQ-09',  90,  'Vite Build Configuration — HMR & Build Output Path Fix',
 'Fixed mismatched Vite outDir vs .esproj BuildOutputFolder causing stale assets; corrected HMR WebSocket routing for dev hot reload.',
 'Portal / UX', 'delivered', '2026-03-29', 1.5, 2.0, 188.00, 250.00),

('NQ-10',  100, 'Dashboard Home — Navigation & UI Overhaul',
 'Rebuilt home toolbar and KPI cards to match Projects page header style; added missing nav items; fixed card bottom padding and minHeight.',
 'Portal / UX', 'delivered', '2026-03-29', 2.5, 3.5, 313.00, 438.00),

('NQ-11',  110, 'System-Wide Grid Layout — Full-Page Fill (Multi-Pass)',
 'Multi-pass layout fix ensuring all 5 main grids (Projects, Sites, Forms, Time Reports, Admin) fill the full page height with no dead space.',
 'Portal / UX', 'delivered', '2026-04-01', 3.5, 4.5, 438.00, 563.00),

('NQ-12',  120, 'Shared DataGrid Component',
 'Extracted reusable DataGrid with consistent column definitions, sorting, and pagination used across all portal pages.',
 'Portal / UX', 'delivered', '2026-04-01', 2.5, 3.5, 313.00, 438.00),

('NQ-13',  130, 'Admin Pages — Comprehensive Fix Pass',
 'Fixed Workers, Materials, Forms, and Sites admin pages: sort states, broken delete flows, null-check crashes, and filter bar consistency.',
 'Portal / UX', 'delivered', '2026-04-01', 1.5, 2.5, 188.00, 313.00),

('NQ-14',  140, 'Dashboard — Status Filter for Operational Alert Functions',
 'Added status toggle (All / Scheduled / In Process / Complete) to dashboard summary cards so PMs can filter active vs historical data.',
 'Portal / UX', 'delivered', '2026-04-01', 1.0, 1.5, 125.00, 188.00),

('NQ-15',  150, 'ArcGIS Client Portal — Leaflet Rewrite & Map Iframe Fix',
 'ArcGIS map iframe was blocked by CORS sandbox policy; replaced with Leaflet-based pipeline viewer with working NPMS tile layers.',
 'Portal / UX', 'delivered', '2026-03-28', 2.5, 3.5, 313.00, 438.00),

('NQ-16',  160, 'Automated Sandbox Deploy Script',
 'Built deploy-sandbox.ps1: dotnet publish → zip → SCP → NSSM restart pipeline. Eliminates manual RDP deployments; repeatable in one command.',
 'Portal / UX', 'delivered', '2026-04-01', 1.0, 2.0, 125.00, 250.00),

-- ── DATABASE & INFRASTRUCTURE ─────────────────────────────────────────────────
('NQ-17',  210, 'FK Companion Index Audit — 35 Missing Indexes Added',
 'Audited all FK columns and added 35 missing index-backed FK constraints. Eliminates full-table scans on every JOIN across core tables.',
 'Database / Infrastructure', 'delivered', '2026-04-01', 2.0, 3.0, 250.00, 375.00),

('NQ-18',  220, 'One Call Query — Unbounded Result Set Cap',
 'fn_one_call_sel_list returned all historical records with no limit; added reasonable cap to prevent dashboard timeouts on large data sets.',
 'Database / Infrastructure', 'delivered', '2026-04-01', 0.5, 1.0, 63.00, 125.00),

('NQ-19',  230, 'Region Deactivation — Audit Identity Fix',
 'Region toggle was recording changed_by=NULL; wired logged-in user identity to audit trail on all region status changes.',
 'Database / Infrastructure', 'delivered', '2026-04-01', 0.5, 1.0, 63.00, 125.00),

('NQ-20',  240, 'Identity Model — Foreman Deduplication (4 Duplicate Pairs)',
 'Found and merged 4 pairs of duplicate foreman employee records created by legacy ArcGIS sync; cleaned referential integrity.',
 'Database / Infrastructure', 'delivered', '2026-04-10', 1.0, 1.5, 125.00, 188.00),

('NQ-21',  250, 'Identity Model — Employee ID Backfill & Role Constraint',
 'Backfilled usercredentials.employee_id for all users; added CHECK constraint on role column; seeded 10 foreman login accounts.',
 'Database / Infrastructure', 'delivered', '2026-04-10', 2.0, 3.0, 250.00, 375.00),

('NQ-22',  260, 'Server-Side Per-User Data Scoping',
 'Implemented Option 2 PM cascade: all project, site, and form queries filtered server-side by the logged-in user''s employee_id. Prevents data leakage between PMs.',
 'Database / Infrastructure', 'delivered', '2026-04-10', 3.0, 4.0, 375.00, 500.00),

('NQ-23',  270, 'Survey123 Import Idempotency — globalid on 10 Sub-Tables',
 'Added globalid column to all 10 Survey123 sub-tables with partial unique indexes. Allows safe re-runs of the migration importer without duplicate insertion.',
 'Database / Infrastructure', 'delivered', '2026-04-30', 2.5, 3.5, 313.00, 438.00),

-- ── MOBILE — FOUNDATION & RELIABILITY ────────────────────────────────────────
('NQ-24',  310, 'First-Login Password Setup Flow',
 'Users with no stored_password are prompted to set a password on first login; server-side enforcement. No pre-seeding of passwords required for production cutover.',
 'Mobile / Foundation', 'delivered', '2026-04-10', 2.0, 3.0, 250.00, 375.00),

('NQ-25',  320, 'Mobile Brand Refresh — NexHub Identity',
 'Replaced generic Expo template with NexHub brand colours, Montserrat fonts, custom icons, and login URL modal. Client-facing identity throughout the app.',
 'Mobile / Foundation', 'delivered', '2026-04-08', 2.5, 3.5, 313.00, 438.00),

('NQ-26',  330, 'WatermelonDB — O(n²) Sync Hang & Null DB Crash Fix',
 'Sync was hanging on large datasets due to O(n²) comparison loop; fixed. Also resolved null DB crash on cold launch before first sync completed.',
 'Mobile / Foundation', 'delivered', '2026-04-08', 2.5, 3.5, 313.00, 438.00),

('NQ-27',  340, '48-Hour Offline Auth Window',
 'Field techs can log in and work without network for up to 48 hours using cached credentials. Session validated against server when connectivity returns.',
 'Mobile / Foundation', 'delivered', '2026-04-25', 4.0, 6.0, 500.00, 750.00),

('NQ-28',  350, 'Full Offline Mode — Site Docs, Local Data, Sync Skip',
 'Site documents served from WatermelonDB when offline; local data preserved through logout; sync silently skipped with appropriate messaging when offline.',
 'Mobile / Foundation', 'delivered', '2026-04-25', 3.5, 5.0, 438.00, 625.00),

('NQ-29',  360, 'OTA Update Banner — Silent Download & Foreground Check',
 'App silently downloads OTA updates on foreground resume and prompts for restart. Users always run the latest version without visiting the App Store.',
 'Mobile / Foundation', 'delivered', '2026-04-29', 1.5, 2.5, 188.00, 313.00),

('NQ-30',  370, 'Force Retry Button — Stuck Outbox Forms',
 'Added Force Retry button to outbox items stuck in Pending Upload state; clears the retry counter and re-triggers sync immediately.',
 'Mobile / Foundation', 'delivered', '2026-04-29', 1.0, 1.5, 125.00, 188.00),

('NQ-31',  380, 'Mobile ER Button — Hospital Lookup Column Error Fix',
 'Emergency response hospital lookup was crashing with 42703 column-does-not-exist on certain devices; fixed column reference in stored function.',
 'Mobile / Foundation', 'delivered', '2026-04-08', 0.5, 1.0, 63.00, 125.00),

('NQ-32',  390, 'WorkerDispatcher DateTime Cast Crash',
 'Background worker was crashing due to unguarded DateTime cast when records had null timestamps; added null guard.',
 'Mobile / Foundation', 'delivered', '2026-04-08', 0.5, 0.5, 63.00, 63.00),

('NQ-33',  400, 'Pre-TestFlight Bug Fixes — P0/P1 Code Review Pass',
 'Comprehensive bug fix pass before first TestFlight release: map pin anchor, quantity zero display bug, FlagBanner extraction, rectifier cleanup, null pointer guards.',
 'Mobile / Foundation', 'delivered', '2026-04-15', 3.5, 5.0, 438.00, 625.00),

('NQ-34',  410, 'First EAS Build & App Store Distribution Setup',
 'Configured EAS project, build profiles, and iOS distribution; resolved Xcode/reanimated/SDK compatibility conflicts across 6+ build attempts; first production AAB/IPA generated.',
 'Mobile / Foundation', 'delivered', '2026-04-03', 3.0, 4.0, 375.00, 500.00),

('NQ-35',  420, 'Mobile Sites Map View with PM Filter',
 'Added map view to the Sites screen showing all active sites as pins; PM filter scopes the map to the current user''s assignments.',
 'Mobile / Foundation', 'delivered', '2026-04-15', 2.5, 3.5, 313.00, 438.00),

-- ── MOBILE — FORM ENHANCEMENTS ───────────────────────────────────────────────
('NQ-36',  510, 'Weather Auto-Capture — All Form Types',
 'Open-Meteo integration auto-captures temperature, wind, and conditions at form creation time on all 6 form types. No API key required. Injected via background sync on submit.',
 'Mobile / Forms', 'delivered', '2026-04-25', 2.5, 3.5, 313.00, 438.00),

('NQ-37',  520, 'County Reverse-Geocode Pre-Population',
 'Nominatim reverse geocode auto-fills County field on NIR and TL Report from site GPS coordinates. Non-fatal when offline.',
 'Mobile / Forms', 'delivered', '2026-04-19', 1.5, 2.0, 188.00, 250.00),

('NQ-38',  530, 'Work Date Field — All Non-Daily Form Types',
 'Added Work Date field to Rectifier, NIR, Ground Bed, TL, and Drawing forms. Server PDF rendering uses form work_date not render date.',
 'Mobile / Forms', 'delivered', '2026-04-20', 1.5, 2.5, 188.00, 313.00),

('NQ-39',  540, 'Keyboard Type Audit — All 6 Form Wizards',
 'Audited and corrected keyboard types (numeric, decimal, phone, email) across every data entry field in all 6 form wizards.',
 'Mobile / Forms', 'delivered', '2026-04-28', 1.5, 2.5, 188.00, 313.00),

('NQ-40',  550, 'Materials Step — Three-Tier Sectioned Picker',
 'Replaced flat materials list with Site Plan / Catalog / Add New three-tier picker. Site plan items flagged for PM review when field quantities differ from plan.',
 'Mobile / Forms', 'delivered', '2026-04-25', 4.5, 6.0, 563.00, 750.00),

('NQ-41',  560, 'Equipment Step — Three-Tier Picker Matching Materials Pattern',
 'Rebuilt equipment selection to match the three-tier materials pattern for consistency.',
 'Mobile / Forms', 'delivered', '2026-04-25', 2.5, 3.5, 313.00, 438.00),

('NQ-42',  570, 'Photo Management Lifecycle',
 'Photos kept on device until PM form approval; deleted after approval or on logout. Prevents storage accumulation across many forms.',
 'Mobile / Forms', 'delivered', '2026-04-29', 1.5, 2.5, 188.00, 313.00),

('NQ-43',  580, 'Discard Draft Button with Confirmation',
 'Added Discard Draft button inside the form wizard header with a confirmation prompt. Techs can abandon in-progress work without navigating away.',
 'Mobile / Forms', 'delivered', '2026-04-29', 1.0, 1.5, 125.00, 188.00),

('NQ-44',  590, 'JSA One-Per-Day Duplicate Prevention',
 'Server-side check prevents technicians from creating a second JSA for the same site on the same work date. Fires on date field change, not just submission.',
 'Mobile / Forms', 'delivered', '2026-04-29', 1.0, 1.5, 125.00, 188.00),

('NQ-45',  600, 'Drawing Canvas — Gesture Compass Overlay & Work Date Sync',
 'Added gesture-based compass overlay so techs can orient sketches accurately; drawing work_date synced from form default.',
 'Mobile / Forms', 'delivered', '2026-04-28', 1.5, 2.5, 188.00, 313.00),

('NQ-46',  610, 'Client Rep Field — Full Mobile Stack',
 'project_site.client_rep added to DB, synced through mobile API, pre-populated read-only in JSA/Daily forms. Previously techs had to type it manually each time.',
 'Mobile / Forms', 'delivered', '2026-04-29', 1.5, 2.5, 188.00, 313.00),

('NQ-47',  620, 'Labor Hours Cascade Defaulting',
 'Row 0 start/end times cascade to new empty labor rows on add. New crew members auto-inherit row 0 times, reducing data entry for standard shift work.',
 'Mobile / Forms', 'delivered', '2026-04-29', 1.0, 1.5, 125.00, 188.00),

('NQ-48',  630, 'Mobile Sync Filter — Active Projects + Scheduled/In Process Sites',
 'Mobile sync now returns only Active projects and Scheduled or In Process sites. Eliminates completed historical data from device, improving sync speed and usability for field techs.',
 'Mobile / Forms', 'delivered', '2026-04-30', 1.5, 2.0, 188.00, 250.00),

('NQ-49',  640, '20 Client-Provided Safety Quotes',
 'Replaced 5 generic placeholder safety quotes with 20 Nexus-branded quotes provided by client.',
 'Mobile / Forms', 'delivered', '2026-04-21', 0.5, 1.0, 63.00, 125.00),

-- ── MOBILE — GROUND BED OVERHAUL ────────────────────────────────────────────
('NQ-50',  710, 'Ground Bed Mobile — Complete 7-Step Wizard Rewrite',
 'Full rewrite of the Ground Bed drilling form into a 7-step guided wizard: Borehole Info, Anode System (with auto-populate from material sheet), Drilling Log, Anode Log, Fill Materials (coke bag calc), Installation Info, and Photos. Validation on every step before advance.',
 'Mobile / Ground Bed', 'delivered', '2026-04-29', 18.0, 22.0, 2250.00, 2750.00),

('NQ-51',  720, 'Ground Bed Mobile — Material Sheet Integration',
 'Mobile Ground Bed form reads from the server material sheet for anode type, coke bag unit weight, and casing specs. Planning fields are locked read-only; actuals entered in field.',
 'Mobile / Ground Bed', 'delivered', '2026-04-29', 3.0, 4.0, 375.00, 500.00),

('NQ-52',  730, 'Ground Bed Mobile — Drilling Log & Fill Test Values',
 'Drilling log with live row updates and keyboard handling; Fill Test Values button for QA testing; anode depth formula auto-calc from spacing configuration.',
 'Mobile / Ground Bed', 'delivered', '2026-04-29', 2.5, 3.5, 313.00, 438.00),

-- ── WEB PDF ENGINE ────────────────────────────────────────────────────────────
('NQ-53',  810, 'PDF Render Architecture — Pivot from Node Sidecar to QuestPDF',
 'Original PDF approach used a Node.js sidecar process (html2pdf). Identified scalability and correctness issues; redesigned as in-process QuestPDF pipeline with SkiaSharp photo rendering. Foundation for all subsequent PDF improvements.',
 'PDF Engine', 'delivered', '2026-04-08', 5.0, 7.0, 625.00, 875.00),

('NQ-54',  820, 'All 6 QuestPDF Document Templates',
 'Pixel-faithful QuestPDF layouts for all 6 form types (Daily/JSA, NIR, Rectifier, Ground Bed, TL Installation, Drawing). Includes page-break handling, signature sections, photo grids, and on-site log tables.',
 'PDF Engine', 'delivered', '2026-04-08', 13.0, 16.0, 1625.00, 2000.00),

('NQ-55',  830, 'PDF Photos — All Non-JSA Form Types',
 'Photo bytes added to server-side PDF renders for NIR, Rectifier, Ground Bed, TL Installation, and Drawing forms. Photos now embedded directly in portal-generated PDFs.',
 'PDF Engine', 'delivered', '2026-04-14', 2.5, 3.5, 313.00, 438.00),

('NQ-56',  840, 'JSA PDF — Client Rep Correct Field Sourcing',
 'Client Rep on JSA PDF was pulling from a stale contact field; corrected to use project_site.client_rep which is the authoritative per-site value.',
 'PDF Engine', 'delivered', '2026-04-30', 0.5, 1.0, 63.00, 125.00),

('NQ-57',  850, 'Date Timezone Fix — UTC Midnight Off-By-One (All 6 Form Types)',
 'Form dates were displaying one day early on CDT devices because UTC midnight was being interpreted as the previous calendar day. Fixed across all 6 form tables.',
 'PDF Engine', 'delivered', '2026-04-14', 1.5, 2.5, 188.00, 313.00),

('NQ-58',  860, 'Drawing Form Web PDF — GPS, Sketch & Signature Fixes',
 'Drawing form PDF: GPS coordinates sourced from site_lat/site_long; sketch correctly rendered from drawing_strokes; signature page break stabilised.',
 'PDF Engine', 'delivered', '2026-04-14', 3.0, 4.0, 375.00, 500.00),

('NQ-59',  870, 'Ground Bed PDF — Complete Rewrite (3 Layout Passes)',
 'Ground Bed PDF was barely functional. Rewrote layout: proper section headers, subtitle, GB Info above drilling log, rebalanced columns, compact anode readings, correct page break handling across drilling log and anode log.',
 'PDF Engine', 'delivered', '2026-04-17', 18.0, 22.0, 2250.00, 2750.00),

-- ── GROUND BED SCHEMATIC ──────────────────────────────────────────────────────
('NQ-60',  910, 'Ground Bed Installation Schematic — SVG Casing Diagram',
 'Custom SVG installation schematic rendered in the Ground Bed PDF and mobile app: hard casing cylinder, anode positions, depth markers, fill material annotation, legend, and PVC/All-Vent labelling. Driven entirely by material sheet and form data.',
 'PDF Engine', 'delivered', '2026-04-20', 13.0, 17.0, 1625.00, 2125.00),

-- ── MATERIAL SHEET SYSTEM ─────────────────────────────────────────────────────
('NQ-61',  1010, 'Material Sheet — Ground Bed Configuration Schema',
 'New DB columns for coke breeze type/container, anode specs, casing depth, vent type, and borehole dimensions. Migrated into site_material_sheet with work_type_id integration.',
 'Material Sheet', 'delivered', '2026-04-22', 3.0, 4.0, 375.00, 500.00),

('NQ-62',  1020, 'Material Sheet — Auto-Calculations (Coke Bags, Vent Length, Borehole Volume)',
 'Three live calculations: borehole volume (π·r²·depth), coke bag count (volume × density ÷ bag weight), vent pipe length (D − B + 1). All update as fields change.',
 'Material Sheet', 'delivered', '2026-04-22', 2.5, 3.5, 313.00, 438.00),

('NQ-63',  1030, 'Material Sheet — Lifecycle Management (Draft → Complete, Versioning)',
 'Material sheet has Draft/Complete lifecycle with version tracking. Completing snapshots the sheet; subsequent edits create new versions. Missing-field validation on Mark Complete.',
 'Material Sheet', 'delivered', '2026-04-23', 3.5, 4.5, 438.00, 563.00),

('NQ-64',  1040, 'Material Sheet — Mobile API Read/Write',
 'Mobile app can read planned values from the material sheet and write actuals back during field work. Ground Bed form pre-populates planning fields from sheet; actuals are locked for field entry.',
 'Material Sheet', 'delivered', '2026-04-25', 3.0, 4.0, 375.00, 500.00),

('NQ-65',  1050, 'Material Sheet — Portal UI (8-Section Accordion, KPI Cards, Jump-to Nav)',
 'Full portal UI for the material sheet: 8 collapsible sections (Borehole, Anode System, Fill Materials, Cement/Plug, Surface & Vent, Wiring & Equip, Site Items, Notes), KPI summary cards, sticky fixed header, jump-to navigation, legend, and planned vs actual column layout.',
 'Material Sheet', 'delivered', '2026-05-04', 14.0, 18.0, 1750.00, 2250.00),

-- ── PM FORM EDIT MODAL ────────────────────────────────────────────────────────
('NQ-66',  1110, 'PM Form Edit Modal — Split-Panel PDF Preview + Editable Fields',
 'Project Managers can edit submitted form data directly in the portal: Edit button opens a split-panel modal with live PDF preview on the left and editable form fields on the right. Full datatype mapping, null→empty-string handling, cascaded save with silent row refresh.',
 'Portal / UX', 'delivered', '2026-04-30', 9.0, 12.0, 1125.00, 1500.00),

-- ── PRODUCTION MIGRATION & DEPLOYMENT ────────────────────────────────────────
('NQ-67',  1210, 'MigrationTool — Custom .NET Migration Runner',
 'Built a custom .NET command-line tool for idempotent SQL migration execution against PostgreSQL. Supports schema, subtable import, drawing-gap, and photo migration commands. Used for the production cutover.',
 'Production Migration', 'delivered', '2026-04-30', 5.0, 7.0, 625.00, 875.00),

('NQ-68',  1220, 'Prodsandbox Dry Run — Full Production Migration Rehearsal',
 '2-day dry run of the full production migration against a restored production database copy: 115 schema migrations, Survey123 sub-table import (35,188 rows), photo migration (5,827 photos to S3), all 6 PDF form types verified. 12 bugs found and fixed. 52/52 smoke tests passing.',
 'Production Migration', 'delivered', '2026-05-02', 8.0, 10.0, 1000.00, 1250.00),

('NQ-69',  1230, 'Production Deployment Runbook',
 'Phase-by-phase production deployment runbook covering: vendor task deletion, schema migration, IIS vs NSSM host detection, application deployment scripts, S3 credential configuration, DNS cutover, mobile OTA, and rollback plan. Credentials documented and IIS/NSSM dual-path scripts written.',
 'Production Migration', 'delivered', '2026-05-04', 3.5, 5.0, 438.00, 625.00),

('NQ-70',  1240, 'Vendor Batch Task Discovery & Deletion Script',
 'Discovered 38 undocumented Windows Task Scheduler tasks (PROD_BAT_NEXUS_*) running bi-directional ArcGIS↔PostgreSQL sync on all EC2 instances — 2 were actively running. If left running during migration they would corrupt both systems. Built delete-vendor-tasks.ps1.',
 'Production Migration', 'delivered', '2026-05-01', 2.0, 3.0, 250.00, 375.00),

('NQ-71',  1250, 'Production Form Count Anomaly — 611 Ghost Records Identified & Fixed',
 'Discovered 611 production forms at status=0 or NULL — invisible in the UI due to a JOIN on form_status, silently excluded. Root cause: legacy batch task inserts with no field data. Patched migration 114 to discard them and prevent the Forms page showing inflated UI counts post-migration.',
 'Production Migration', 'delivered', '2026-05-02', 2.0, 3.0, 250.00, 375.00)

ON CONFLICT (id) DO UPDATE SET
  sort_order     = EXCLUDED.sort_order,
  title          = EXCLUDED.title,
  description    = EXCLUDED.description,
  category       = EXCLUDED.category,
  status         = EXCLUDED.status,
  delivered_date = EXCLUDED.delivered_date,
  est_hrs_lo     = EXCLUDED.est_hrs_lo,
  est_hrs_hi     = EXCLUDED.est_hrs_hi,
  est_value_lo   = EXCLUDED.est_value_lo,
  est_value_hi   = EXCLUDED.est_value_hi;

-- ── Summary ───────────────────────────────────────────────────────────────────
SELECT
  category,
  COUNT(*) as items,
  SUM(est_hrs_lo)   as hrs_lo,
  SUM(est_hrs_hi)   as hrs_hi,
  SUM(est_value_lo) as value_lo,
  SUM(est_value_hi) as value_hi
FROM nq_items
WHERE status = 'delivered'
GROUP BY category
ORDER BY category;

SELECT
  COUNT(*) as total_items,
  SUM(est_hrs_lo)   as total_hrs_lo,
  SUM(est_hrs_hi)   as total_hrs_hi,
  SUM(est_value_lo) as total_value_lo,
  SUM(est_value_hi) as total_value_hi
FROM nq_items
WHERE status = 'delivered';
