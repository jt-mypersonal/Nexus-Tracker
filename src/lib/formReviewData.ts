export type FieldType =
  | 'Text' | 'Multiline' | 'Decimal' | 'Integer' | 'Date'
  | 'Picker' | 'Multi-select' | 'Toggle' | 'Calculated' | 'Signature'
  | 'Photo' | 'Drawing' | 'Combo Picker' | '2-Tier Picker' | 'Time'

export type RequiredLevel = 'YES' | 'COND' | 'NO'

export interface FormField {
  label: string
  type: FieldType
  required: RequiredLevel
  sync: string | null  // null = tech enters it; string = source label from portal
  note?: string        // extra context shown under the field
}

export interface FormStep {
  title: string
  blockCondition?: string
  stepNote?: string
  fields: FormField[]
  isRepeating?: boolean
}

export interface FormDef {
  id: string
  label: string
  steps: FormStep[]
}

// ── Daily Report / JSA ────────────────────────────────────────────────────────

const daily: FormDef = {
  id: 'daily',
  label: 'Daily Report / JSA',
  steps: [
    {
      title: 'Job Information',
      blockCondition: 'Work Description and Task Description are both required.',
      fields: [
        { label: 'PO Number',             type: 'Text',      required: 'NO',   sync: 'Projects → PO Number' },
        { label: 'Client Representative', type: 'Text',      required: 'NO',   sync: 'Sites → Site Information → Client Rep', note: 'Read-only on mobile — set in portal only.' },
        { label: 'Job Number',            type: 'Text',      required: 'NO',   sync: 'Projects → Project Number', note: 'Read-only if synced.' },
        { label: 'Work Date',             type: 'Date',      required: 'NO',   sync: null, note: 'Defaults to today.' },
        { label: 'Work Description',      type: 'Multiline', required: 'YES',  sync: null },
        { label: 'Task Description',      type: 'Multiline', required: 'YES',  sync: null },
        { label: 'Weather',               type: 'Calculated',required: 'NO',   sync: 'Device GPS (Open-Meteo)', note: 'Auto-captured on form open. Not editable.' },
      ],
    },
    {
      title: 'Site Conditions',
      blockCondition: 'Potential Hazards required.',
      fields: [
        { label: 'Equipment Involved',       type: 'Multi-select', required: 'NO',  sync: null, note: 'Options = equipment categories from server.' },
        { label: 'Environmental Conditions', type: 'Multi-select', required: 'NO',  sync: null },
        { label: 'Potential Hazards',        type: 'Multi-select', required: 'YES', sync: null },
        { label: 'Hazard Controls',          type: 'Multi-select', required: 'NO',  sync: null },
        { label: 'PPE Required',             type: 'Multi-select', required: 'NO',  sync: null },
        { label: 'Chemicals on Site',        type: 'Text',         required: 'NO',  sync: null },
        { label: 'Permits Required',         type: 'Multi-select', required: 'NO',  sync: null },
      ],
    },
    {
      title: 'Safety Checklist',
      stepNote: 'All toggles optional. Each is a yes/no confirmation.',
      fields: [
        { label: 'Fire / explosion / toxic hazards identified and addressed?', type: 'Toggle', required: 'NO', sync: null },
        { label: 'MSDS / SDS sheets reviewed for all chemicals?',             type: 'Toggle', required: 'NO', sync: null },
        { label: 'Emergency procedures confirmed with team?',                  type: 'Toggle', required: 'NO', sync: null },
        { label: 'Weight / load limits confirmed?',                            type: 'Toggle', required: 'NO', sync: null },
        { label: 'All connections and tie-ins checked?',                       type: 'Toggle', required: 'NO', sync: null },
        { label: 'Team briefed on job scope and hazards?',                     type: 'Toggle', required: 'NO', sync: null },
        { label: 'All site hazards identified and documented?',                type: 'Toggle', required: 'NO', sync: null },
        { label: 'Safe methods implemented for all tasks?',                    type: 'Toggle', required: 'NO', sync: null },
        { label: 'Task confirmed feasible and safe to proceed?',               type: 'Toggle', required: 'NO', sync: null },
      ],
    },
    {
      title: 'Emergency Information',
      fields: [
        { label: 'Nearest Hospital',        type: 'Text', required: 'NO', sync: 'Device GPS', note: 'Auto-filled via GPS hospital lookup on open.' },
        { label: 'Hospital Address',        type: 'Text', required: 'NO', sync: 'Device GPS' },
        { label: 'Hospital Phone',          type: 'Text', required: 'NO', sync: 'Device GPS' },
        { label: 'Distance to Hospital',    type: 'Text', required: 'NO', sync: 'Device GPS', note: 'e.g. 4.2 miles' },
        { label: 'Emergency Transport',     type: 'Text', required: 'NO', sync: null, note: 'e.g. Ambulance / personal vehicle' },
        { label: 'One Call #',              type: 'Text', required: 'NO', sync: 'Sites → Site Information → One Call Number' },
        { label: 'Company Representative', type: 'Text', required: 'NO', sync: 'Projects → Client Contact', note: 'Read-only if synced.' },
        { label: 'Foreman',                type: 'Text', required: 'NO', sync: 'Projects → Foreman', note: 'Read-only if synced.' },
      ],
    },
    {
      title: 'Job Steps',
      isRepeating: true,
      stepNote: 'Hazard and Control pickers pre-load from Step 2 selections. Free text also accepted.',
      fields: [
        { label: 'Step Number',      type: 'Calculated', required: 'NO',  sync: 'Auto-increments' },
        { label: 'Step Description', type: 'Multiline',  required: 'YES', sync: null },
        { label: 'Hazard for step',  type: 'Text',       required: 'NO',  sync: 'From Step 2 – Potential Hazards' },
        { label: 'Control measure',  type: 'Text',       required: 'NO',  sync: 'From Step 2 – Hazard Controls' },
      ],
    },
    {
      title: 'Materials & Equipment',
      blockCondition: 'At least one material AND one equipment item required.',
      isRepeating: true,
      stepNote: 'Items pre-loaded from site Material Plan. Field additions flagged for PM review.',
      fields: [
        { label: 'Material Name',   type: 'Text',    required: 'YES', sync: 'Sites → Materials tab → Planned Materials' },
        { label: 'Material Qty',    type: 'Decimal', required: 'NO',  sync: null },
        { label: 'Equipment Name',  type: 'Text',    required: 'YES', sync: 'Sites → Equipment tab → Planned Equipment' },
        { label: 'Equipment Qty',   type: 'Decimal', required: 'NO',  sync: null },
      ],
    },
    {
      title: 'Labor',
      isRepeating: true,
      stepNote: 'Time In / Time Out from row 1 default to all subsequent rows.',
      fields: [
        { label: 'Full Name',  type: 'Text',      required: 'NO', sync: null },
        { label: 'Time In',    type: 'Time',      required: 'NO', sync: null, note: 'Defaults from row 1 on later rows.' },
        { label: 'Time Out',   type: 'Time',      required: 'NO', sync: null, note: 'Defaults from row 1 on later rows.' },
        { label: 'Signature',  type: 'Signature', required: 'NO', sync: null },
      ],
    },
    {
      title: 'Subcontractors on Site',
      isRepeating: true,
      stepNote: 'Site-plan subs shown automatically. Ad-hoc entry available.',
      fields: [
        { label: 'Present on site?',     type: 'Toggle',  required: 'NO',  sync: 'Sites → Subcontractors tab' },
        { label: 'Hours on site today',  type: 'Decimal', required: 'NO',  sync: null, note: 'Shown when toggled active.' },
        { label: 'Representative',       type: 'Text',    required: 'NO',  sync: null },
        { label: 'Type (ad-hoc)',         type: 'Text',    required: 'NO',  sync: null, note: 'Ad-hoc only – e.g. Hydro, Matting.' },
        { label: 'Company Name (ad-hoc)', type: 'Text',   required: 'COND',sync: null, note: 'Required for ad-hoc entries.' },
      ],
    },
    {
      title: 'On Site Log',
      isRepeating: true,
      stepNote: 'Pre-seeded from Labor step on first entry (names + signatures carried over).',
      fields: [
        { label: 'Full Name', type: 'Text',      required: 'NO', sync: 'From Step 7 – Labor (seeded)' },
        { label: 'Signature', type: 'Signature', required: 'NO', sync: 'From Step 7 – Labor (seeded)' },
      ],
    },
    {
      title: 'Job Notes',
      fields: [
        { label: 'Submitted By',             type: 'Text',      required: 'NO', sync: 'Login username (pre-filled)' },
        { label: 'Sign to certify report',   type: 'Signature', required: 'NO', sync: null },
        { label: 'Additional Notes',         type: 'Multiline', required: 'NO', sync: null },
      ],
    },
    {
      title: 'Photos',
      fields: [
        { label: 'Photos', type: 'Photo', required: 'NO', sync: null, note: 'Multiple allowed. Uploaded to S3 on submit.' },
      ],
    },
  ],
}

// ── TL Installation Report ────────────────────────────────────────────────────

const tlreport: FormDef = {
  id: 'tlreport',
  label: 'TL Installation Report',
  steps: [
    {
      title: 'Location',
      blockCondition: 'Line Name / # required.',
      fields: [
        { label: 'Work Date',               type: 'Date', required: 'NO',  sync: null, note: 'Defaults to today.' },
        { label: 'One Call / 811 Date & #', type: 'Text', required: 'NO',  sync: 'Sites → Site Information → One Call Number' },
        { label: 'County / District',       type: 'Text', required: 'NO',  sync: 'Device GPS', note: 'Auto reverse-geocoded from site GPS.' },
        { label: 'Location Description',    type: 'Text', required: 'YES', sync: null, note: 'Milepost, address, or landmark.' },
        { label: 'Line Name / #',           type: 'Text', required: 'YES', sync: null },
      ],
    },
    {
      title: 'Survey Data',
      blockCondition: 'DC Reading required. Block if any value outside hard limit.',
      stepNote: 'Amber warnings (non-blocking): AC > 10 Vac · DC < -3 or > 1.0 Vdc · Wall Thickness < 0.18 or > 0.50 in.',
      fields: [
        { label: 'AC Reading (Vac)',         type: 'Decimal', required: 'NO',  sync: null, note: 'Range 0–100 Vac. Warn > 10.' },
        { label: 'DC Reading – Pipe to Soil (Vdc)', type: 'Decimal', required: 'YES', sync: null, note: 'Range -5.0 to 1.0. Warn < -3 or > 1.' },
        { label: 'Depth of Cover (in)',       type: 'Decimal', required: 'NO',  sync: null },
        { label: 'Coating Type / Condition', type: 'Picker',  required: 'NO',  sync: null, note: 'FBE / Coal Tar / 3-Layer PE / Powercrete / Tape Wrap / Bare / Unknown / Other.' },
        { label: 'Wall Thickness (in)',       type: 'Decimal', required: 'NO',  sync: null, note: 'Range 0.10–0.75. Warn < 0.18 or > 0.50.' },
      ],
    },
    {
      title: 'Remarks',
      fields: [
        { label: 'Remarks', type: 'Multiline', required: 'NO', sync: null },
      ],
    },
    {
      title: 'Signatures & Photos',
      fields: [
        { label: 'Foreman / Technician Signature', type: 'Signature', required: 'NO', sync: null },
        { label: 'Photos',                          type: 'Photo',     required: 'NO', sync: null },
      ],
    },
  ],
}

// ── Negative Install Report ───────────────────────────────────────────────────

const negative: FormDef = {
  id: 'negative',
  label: 'Negative Install Report',
  steps: [
    {
      title: 'Location',
      blockCondition: 'Line Name / # and Location Description required.',
      fields: [
        { label: 'Work Date',             type: 'Date', required: 'NO',  sync: null, note: 'Defaults to today.' },
        { label: 'One Call / 811 #',      type: 'Text', required: 'NO',  sync: 'Sites → Site Information → One Call Number' },
        { label: 'County / District',     type: 'Text', required: 'NO',  sync: 'Device GPS', note: 'Auto reverse-geocoded.' },
        { label: 'Location Description',  type: 'Text', required: 'YES', sync: null },
        { label: 'Line Name / #',         type: 'Text', required: 'YES', sync: null },
      ],
    },
    {
      title: 'Survey Data',
      blockCondition: 'DC Reading required. Block if any value outside hard limit.',
      stepNote: 'Amber warnings: AC > 10 Vac · DC < -3 or > 1.0 Vdc · Wall Thickness < 0.18 or > 0.50 in · Depth outside 6–120 in.',
      fields: [
        { label: 'AC Reading (Vac)',         type: 'Decimal', required: 'NO',  sync: null, note: 'Range 0–100. Warn > 10.' },
        { label: 'DC Reading (Vdc)',          type: 'Decimal', required: 'YES', sync: null, note: 'Range -5.0 to 1.0. Warn < -3 or > 1.' },
        { label: 'Depth of Cover (in)',       type: 'Decimal', required: 'NO',  sync: null, note: 'Range 6–120. Warn and block outside.' },
        { label: 'Coating Type / Condition', type: 'Picker',  required: 'NO',  sync: null, note: 'FBE / Coal Tar / 3-Layer PE / Powercrete / Tape Wrap / Bare / Unknown / Other.' },
        { label: 'Wall Thickness (in)',       type: 'Decimal', required: 'NO',  sync: null, note: 'Range 0.10–0.75. Warn < 0.18 or > 0.50.' },
      ],
    },
    {
      title: 'Remarks',
      fields: [
        { label: 'Remarks', type: 'Multiline', required: 'NO', sync: null },
      ],
    },
    {
      title: 'Signatures & Photos',
      fields: [
        { label: 'Foreman / Technician Signature', type: 'Signature', required: 'NO', sync: null },
        { label: 'Photos',                          type: 'Photo',     required: 'NO', sync: null },
      ],
    },
  ],
}

// ── Rectifier Report ──────────────────────────────────────────────────────────

const rectifier: FormDef = {
  id: 'rectifier',
  label: 'Rectifier Report',
  steps: [
    {
      title: 'Unit Identification',
      blockCondition: 'Rectifier # required.',
      fields: [
        { label: 'Work Date',     type: 'Date',        required: 'NO',  sync: null, note: 'Defaults to today.' },
        { label: 'Job Number',    type: 'Text',        required: 'NO',  sync: 'Projects → Project Number' },
        { label: 'Rectifier #',   type: 'Text',        required: 'YES', sync: null, note: 'e.g. CO Rd 411 MR B1.' },
        { label: 'Manufacturer',  type: 'Combo Picker',required: 'NO',  sync: null, note: 'Server-loaded list. Free text also accepted.' },
        { label: 'Model #',       type: 'Text',        required: 'NO',  sync: null },
        { label: 'Serial #',      type: 'Text',        required: 'NO',  sync: null },
      ],
    },
    {
      title: 'Power Source',
      fields: [
        { label: 'Power Available?',  type: 'Toggle',  required: 'NO', sync: null, note: 'Defaults on.' },
        { label: 'Power Company',     type: 'Text',    required: 'NO', sync: null },
        { label: 'Meter #',           type: 'Text',    required: 'NO', sync: null },
        { label: 'Watt Hours',        type: 'Integer', required: 'NO', sync: null },
        { label: 'AC Input (V)',       type: 'Decimal', required: 'NO', sync: null },
        { label: 'Tap Setting',       type: 'Text',    required: 'NO', sync: null, note: 'e.g. 3-A.' },
      ],
    },
    {
      title: 'Electrical Readings',
      blockCondition: 'DC Volts and DC Amps required. Block if either > 1.2× Rated. I/O range -5.0 to 1.0 Vdc.',
      stepNote: 'Shunt = 2-tier picker (Brand → Model). Entering Shunt mV auto-fills DC Amps. Rated values entered in Step 4 drive validation here.',
      fields: [
        { label: 'DC Volts (V)',    type: 'Decimal',    required: 'YES', sync: null, note: 'Warn if > Rated. Block if > 1.2× Rated.' },
        { label: 'DC Amps (A)',     type: 'Decimal',    required: 'YES', sync: 'Calculated from Shunt mV × factor', note: 'Auto-filled from mV. Editable.' },
        { label: 'Shunt Brand',     type: '2-Tier Picker', required: 'NO',  sync: null, note: 'Options: COTT, Holloway.' },
        { label: 'Shunt Model',     type: '2-Tier Picker', required: 'NO',  sync: null },
        { label: 'Shunt mV',        type: 'Decimal',    required: 'NO',  sync: null, note: 'Entering this auto-fills DC Amps.' },
        { label: 'P/S Reading (Vdc)',type: 'Decimal',   required: 'NO',  sync: null, note: 'Signed.' },
        { label: 'I/O (Vdc)',       type: 'Decimal',    required: 'NO',  sync: null, note: 'Signed. Range -5.0 to 1.0. Warn < -3.' },
      ],
    },
    {
      title: 'RMU',
      stepNote: 'Rated Volts / Amps are used to validate Step 3 readings. RMU fields hidden when toggle is off.',
      fields: [
        { label: 'Rated Volts (V)',  type: 'Decimal',    required: 'NO',   sync: null, note: 'From nameplate. Drives Step 3 validation.' },
        { label: 'Rated Amps (A)',   type: 'Decimal',    required: 'NO',   sync: null, note: 'From nameplate. Drives Step 3 validation.' },
        { label: 'RMU Installed?',   type: 'Toggle',     required: 'NO',   sync: null, note: 'Defaults on. Toggle off to hide RMU fields.' },
        { label: 'RMU Manufacturer', type: 'Combo Picker', required: 'COND', sync: null, note: 'Shown when RMU toggle on. Options: Melsir / AI / Mobile Tex / Aorox / Other.' },
        { label: 'RMU Model #',      type: 'Text',       required: 'COND', sync: null },
        { label: 'RMU Serial #',     type: 'Text',       required: 'COND', sync: null },
      ],
    },
    {
      title: 'Connections',
      isRepeating: true,
      stepNote: 'Negative Connections: pipeline names loadable from NIR records via button. Anode Output: master shunt picker fills all rows; entering mV auto-fills Amps.',
      fields: [
        { label: '[Neg. Conn.] Pipeline Name', type: 'Text',        required: 'NO', sync: 'NIR records for this site (or manual)' },
        { label: '[Neg. Conn.] P/S Reading (Vdc)', type: 'Decimal', required: 'NO', sync: null, note: 'Signed.' },
        { label: '[Neg. Conn.] Amps (A)',      type: 'Decimal',     required: 'NO', sync: null },
        { label: '[Anode Out.] Shunt Brand',   type: '2-Tier Picker', required: 'NO', sync: null },
        { label: '[Anode Out.] Shunt Model',   type: '2-Tier Picker', required: 'NO', sync: null },
        { label: '[Anode Out.] Shunt mV',      type: 'Decimal',     required: 'NO', sync: null },
        { label: '[Anode Out.] Amps (A)',       type: 'Decimal',     required: 'NO', sync: 'Calculated from mV × factor', note: 'Editable override.' },
      ],
    },
    {
      title: 'Final',
      fields: [
        { label: 'Remarks', type: 'Multiline', required: 'NO', sync: null },
      ],
    },
    {
      title: 'Signatures & Photos',
      fields: [
        { label: 'Foreman / Technician Signature', type: 'Signature', required: 'NO', sync: null },
        { label: 'Photos',                          type: 'Photo',     required: 'NO', sync: null },
      ],
    },
  ],
}

// ── Ground Bed Drilling Log ───────────────────────────────────────────────────

const groundbed: FormDef = {
  id: 'groundbed',
  label: 'Ground Bed Drilling Log',
  steps: [
    {
      title: 'Ground Bed Info',
      blockCondition: 'Number of Anodes, Coke Bags, Top of Coke, and Coke Type required.',
      stepNote: 'All fields pre-populated from Material Sheet. Schematic on PDF page 2 requires: Casing Depth + Spacing from Bottom + Anode Spacing CL + Anode Type + Number of Anodes. Missing any = schematic silently omitted.',
      fields: [
        { label: 'Anode Brand',               type: 'Text',       required: 'NO',   sync: 'Material Sheet → Anode Brand' },
        { label: 'Number of Anodes',          type: 'Integer',    required: 'YES',  sync: 'Material Sheet → Number of Anodes' },
        { label: 'Anode Cable Spec',          type: 'Text',       required: 'NO',   sync: 'Material Sheet → Anode Cable Spec', note: 'Appears on schematic.' },
        { label: 'Anode Lead Size',           type: 'Picker',     required: 'NO',   sync: 'Material Sheet → Anode Lead Size' },
        { label: 'Anode Lead Type',           type: 'Picker',     required: 'NO',   sync: 'Material Sheet → Anode Lead Type' },
        { label: '#1 Lead Length (ft)',        type: 'Decimal',    required: 'NO',   sync: 'Material Sheet → Lead Length' },
        { label: 'Coke Bags',                 type: 'Integer',    required: 'YES',  sync: 'Material Sheet → Estimated Bag Qty', note: 'Tech enters actual used. Unit weight derived from mat. sheet.' },
        { label: 'Coke Weight (calculated)',  type: 'Calculated', required: 'NO',   sync: 'Calculated: Bags × unit weight', note: 'Read-only.' },
        { label: 'Top of Coke (ft)',           type: 'Decimal',    required: 'YES',  sync: 'Material Sheet → Top of Coke' },
        { label: 'Coke Type',                 type: 'Picker',     required: 'YES',  sync: 'Material Sheet → Coke Type', note: 'Options include Loresco SC-3/SS-3/EC-2/RS-3, CarboCoke, others.' },
        { label: 'Bentonite Plug (ft)',        type: 'Decimal',    required: 'NO',   sync: 'Material Sheet → Bentonite Plug' },
        { label: 'Fill Material',             type: 'Picker',     required: 'NO',   sync: null, note: 'Options: Pea Gravel / Other / None. None = no fill zone on schematic.' },
        { label: 'Fill Material Name',        type: 'Text',       required: 'COND', sync: null, note: 'Shown when Fill Material = Other.' },
        { label: 'Pea Gravel / Fill Depth (ft)', type: 'Decimal', required: 'COND', sync: 'Material Sheet → Pea Gravel', note: 'Hidden when Fill Material = None.' },
        { label: 'Plug Depth (ft)',            type: 'Text',       required: 'NO',   sync: 'Material Sheet → Cement Plug Depth', note: 'Can be range e.g. 325\'-225\'.' },
        { label: 'Plug Length (ft)',           type: 'Decimal',    required: 'NO',   sync: 'Material Sheet → Cement Plug Length' },
        { label: 'Plug Type',                 type: 'Picker',     required: 'NO',   sync: 'Material Sheet → Cement Plug Type' },
        { label: 'Casing Length (ft)',         type: 'Text',       required: 'NO',   sync: 'Material Sheet → Casing Length' },
        { label: 'Casing Diameter (in)',       type: 'Text',       required: 'NO',   sync: 'Material Sheet → Casing Diameter', note: 'Appears on schematic.' },
        { label: 'Casing Grout',              type: 'Text',       required: 'NO',   sync: 'Material Sheet → Casing Grout' },
        { label: 'Vent Material',             type: 'Picker',     required: 'NO',   sync: null, note: 'Options: PVC / AllVent / N/A.' },
        { label: 'AllVent Size',              type: 'Picker',     required: 'COND', sync: null, note: 'Shown when Vent = AllVent. Options: 1" / 1.25" / 2".' },
        { label: 'PVC Size',                  type: 'Text',       required: 'COND', sync: null, note: 'Shown when Vent = PVC.' },
        { label: 'AllVent Length (ft)',        type: 'Calculated', required: 'COND', sync: 'Calculated: = Top of Coke', note: 'Read-only. Shown when AllVent.' },
        { label: 'Vent Length (ft)',           type: 'Decimal',    required: 'COND', sync: null, note: 'Shown when Vent = PVC. Manual entry.' },
      ],
    },
    {
      title: 'Installation Info',
      blockCondition: 'System / Line Name, Total Depth, and Interval required. Depth max 1,000 ft.',
      fields: [
        { label: 'Work Date',                  type: 'Date',    required: 'NO',  sync: null, note: 'Defaults to today.' },
        { label: 'System / Line Name',         type: 'Text',    required: 'YES', sync: null, note: 'Shown as Site Name on the PDF.' },
        { label: 'Location',                   type: 'Text',    required: 'NO',  sync: 'Sites → Site Information → City / State' },
        { label: 'Total Depth (ft)',            type: 'Decimal', required: 'YES', sync: 'Material Sheet → Hole Depth' },
        { label: 'Interval (ft)',               type: 'Decimal', required: 'YES', sync: 'Material Sheet → Interval', note: 'Row count hint shown: Total Depth / Interval.' },
        { label: 'Diameter',                   type: 'Picker',  required: 'NO',  sync: 'Material Sheet → Diameter', note: 'Options: 6/8/10/12/14 in.' },
        { label: 'Casing Depth (ft)',           type: 'Decimal', required: 'NO',  sync: 'Material Sheet → Casing Length', note: 'Required for schematic. Enter manually if blank.' },
        { label: 'Anode Type',                 type: 'Picker',  required: 'NO',  sync: 'Material Sheet → Anode Type', note: 'Auto-sets anode size + length for calc and schematic.' },
        { label: 'Spacing from Bottom (B, ft)', type: 'Decimal', required: 'NO',  sync: 'Material Sheet → Spacing from Bottom' },
        { label: 'Anode Spacing CL (S, ft)',    type: 'Decimal', required: 'NO',  sync: 'Material Sheet → Anode Spacing CL' },
      ],
    },
    {
      title: 'Logging Setup',
      blockCondition: 'Logging Volts required.',
      fields: [
        { label: 'Logging Anode',   type: 'Picker',  required: 'NO',  sync: null, note: 'Anode used for measurements. Appears in PDF headers.' },
        { label: 'Voltage Unit',    type: 'Toggle',  required: 'NO',  sync: null, note: 'V or mV. Defaults V. Switching converts stored value.' },
        { label: 'Logging Volts',   type: 'Decimal', required: 'YES', sync: 'Material Sheet → Logging Volts', note: 'Ohms = Logging Volts / Amps.' },
      ],
    },
    {
      title: 'Drilling Log',
      isRepeating: true,
      blockCondition: 'Every row must have a Geological Type before advancing.',
      stepNote: 'Two-pass: fill Geo Type while drilling (all rows required), add Amps after anode placement. Bulk range-fill panel available. "Fill test values" link populates all rows with Sand / 0.5 A.',
      fields: [
        { label: 'Depth (ft)',      type: 'Calculated', required: 'NO',  sync: 'Auto-generated: Interval × row', note: 'Read-only.' },
        { label: 'Geological Log', type: 'Multi-select', required: 'YES', sync: null, note: 'Tap to open checkbox picker. Multiple types per row. PDF shows comma-separated.' },
        { label: 'Amps (A)',        type: 'Decimal',    required: 'NO',  sync: null, note: 'Enter after anode placement.' },
        { label: 'Ohms',            type: 'Calculated', required: 'NO',  sync: 'Calculated: Logging Volts / Amps', note: 'Read-only.' },
      ],
    },
    {
      title: 'Anode Log',
      isRepeating: true,
      blockCondition: 'All anode rows must have a reading before submitting.',
      stepNote: 'Depth formula: D − (B + L÷24 + i×S), i=0 deepest. Stack Amps and Stack Ohms shown below rows. "Fill test values" link fills all with 0.5 A.',
      fields: [
        { label: 'Anode #',            type: 'Calculated', required: 'NO',  sync: 'Sequential (1 = deepest)', note: 'Read-only.' },
        { label: 'Depth (ft)',          type: 'Decimal',    required: 'NO',  sync: 'Calculated from B, S, L, D', note: 'Editable override.' },
        { label: 'Anode Readings (A)',  type: 'Decimal',    required: 'YES', sync: null, note: 'All rows required before submit.' },
      ],
    },
    {
      title: 'Notes',
      fields: [
        { label: 'Comments / Notes', type: 'Multiline', required: 'NO', sync: null },
      ],
    },
    {
      title: 'Signatures & Photos',
      fields: [
        { label: 'Foreman / Technician Signature', type: 'Signature', required: 'NO', sync: null },
        { label: 'Photos',                          type: 'Photo',     required: 'NO', sync: null },
      ],
    },
  ],
}

// ── Drawing Form ──────────────────────────────────────────────────────────────

const drawing: FormDef = {
  id: 'drawing',
  label: 'Drawing Form',
  steps: [
    {
      title: 'Site Information',
      blockCondition: 'System / Line Name required.',
      stepNote: 'Client Name, Location, and GPS Coordinates are read-only — pre-filled from sync.',
      fields: [
        { label: 'Client Name',         type: 'Calculated', required: 'NO',  sync: 'Projects → Client', note: 'Read-only on mobile.' },
        { label: 'Location',            type: 'Calculated', required: 'NO',  sync: 'Sites → Site Information → City / State', note: 'Read-only on mobile.' },
        { label: 'GPS Coordinates',     type: 'Calculated', required: 'NO',  sync: 'Site latitude / longitude', note: 'Read-only on mobile.' },
        { label: 'Work Date',           type: 'Date',       required: 'NO',  sync: null, note: 'Defaults to today.' },
        { label: 'System / Line Name',  type: 'Text',       required: 'YES', sync: null },
      ],
    },
    {
      title: 'Sketch',
      blockCondition: 'At least one drawing element required.',
      stepNote: 'Tools: Pen / Line / Circle / Rectangle / Text annotation / Compass. Templates: pipeline cross-section, rectifier box, test station, power pole, road / intersection. Templates are movable and scalable.',
      fields: [
        { label: 'Sketch', type: 'Drawing', required: 'YES', sync: null, note: 'Stored as element array. Rendered as SVG in PDF.' },
      ],
    },
    {
      title: 'Comments',
      fields: [
        { label: 'Comments', type: 'Multiline', required: 'NO', sync: null },
      ],
    },
    {
      title: 'Signatures & Photos',
      fields: [
        { label: 'Foreman / Technician Signature', type: 'Signature', required: 'NO', sync: null },
        { label: 'Photos',                          type: 'Photo',     required: 'NO', sync: null },
      ],
    },
  ],
}

// ── Export ────────────────────────────────────────────────────────────────────

export const FORMS: FormDef[] = [daily, tlreport, negative, rectifier, groundbed, drawing]

export function getForm(id: string): FormDef | undefined {
  return FORMS.find(f => f.id === id)
}
