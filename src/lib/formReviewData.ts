export type FieldType =
  | 'Text' | 'Multiline' | 'Decimal' | 'Integer' | 'Date'
  | 'Picker' | 'Multi-select' | 'Toggle' | 'Calculated' | 'Signature'
  | 'Photo' | 'Drawing' | 'Combo Picker' | '2-Tier Picker' | 'Time'
  | 'Table' | 'Button' | 'Number' | '2-Tier Picker (Shunt)'

export type RequiredLevel = 'YES' | 'COND' | 'NO'

export interface FormField {
  label: string
  type: FieldType
  required: RequiredLevel
  sync: string | null  // mobile: source label from portal. portal forms: data origin / who fills it
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

// ── Site Modal — Materials Sheet ─────────────────────────────────────────────
// Covers the Materials tab in the web portal Site modal.
// "sync" column = who fills this / where the data originates.

const materials: FormDef = {
  id: 'materials',
  label: 'Materials Sheet (Portal)',
  steps: [
    {
      title: 'General Controls',
      stepNote: 'Top-level UX elements — navigation, save, and copy functionality.',
      fields: [
        { label: 'Copy From button',              type: 'Button',     required: 'NO',  sync: 'PM action',       note: 'Copies planned values from another site. Strips actuals. Only merges null-only fields.' },
        { label: 'Save button',                   type: 'Button',     required: 'YES', sync: 'PM action',       note: 'POSTs all planned fields to server. Should not overwrite mobile actuals.' },
        { label: 'Completion % indicator',        type: 'Calculated', required: 'NO',  sync: 'Auto-calculated', note: 'Shows X/Y of KEY_FIELD inputs filled. Count and denominator should be accurate.' },
        { label: 'Missing field red tint',        type: 'Calculated', required: 'NO',  sync: 'Auto-calculated', note: 'KEY_FIELD inputs highlight red when empty. Verify all required planning fields are marked.' },
        { label: 'Actuals — read-only enforcement', type: 'Calculated', required: 'YES', sync: 'Mobile → DB',  note: 'Actuals populated by field crew on mobile. Must not be editable by PM in the portal.' },
      ],
    },
    {
      title: 'Anode System',
      stepNote: 'Anode brand, lead specs, and per-anode depth planning. Pre-populates the Ground Bed mobile form.',
      fields: [
        { label: 'Anode Brand',                   type: 'Picker',     required: 'YES', sync: 'PM-entered',      note: 'Drives brand label on ground bed PDF. Options: LORESCO, MMO, Graphite, Other.' },
        { label: 'Anode Type',                    type: 'Picker',     required: 'YES', sync: 'PM-entered',      note: 'Drives anode size, length, and schematic geometry on the ground bed PDF.' },
        { label: 'Number of Anodes',              type: 'Integer',    required: 'YES', sync: 'PM-entered',      note: 'Drives anode row count in Ground Bed mobile form and Anode Output in Rectifier mobile form.' },
        { label: 'Anode Lead Size',               type: 'Picker',     required: 'NO',  sync: 'PM-entered' },
        { label: 'Anode Lead Type',               type: 'Picker',     required: 'NO',  sync: 'PM-entered' },
        { label: 'Anode Cable Spec',              type: 'Text',       required: 'NO',  sync: 'PM-entered',      note: 'Shows on schematic label. e.g. #8 Kynar.' },
        { label: '#1 Lead Length (ft)',           type: 'Decimal',    required: 'NO',  sync: 'PM-entered' },
        { label: 'Longest Lead (auto-calc)',       type: 'Calculated', required: 'NO',  sync: 'Auto-calculated', note: 'Max of all per-anode depths + lead length. Shown read-only.' },
        { label: 'Anode depth rows (per anode)',  type: 'Table',      required: 'COND',sync: 'PM-entered',      note: 'One row per anode. Depth is auto-filled when schematic inputs (B, S, D, L) are complete.' },
        { label: 'Anode depth actuals (mobile)',  type: 'Calculated', required: 'NO',  sync: 'Mobile → DB',     note: 'Read-only. Filled by field crew in Ground Bed Anode Log step.' },
      ],
    },
    {
      title: 'Fill Materials (Coke)',
      stepNote: 'Coke breeze specifications for ground bed fill. Drives coke bag count on ground bed PDF.',
      fields: [
        { label: 'Coke Type',                     type: 'Picker',     required: 'YES', sync: 'PM-entered',      note: 'Options: Loresco SC-3/SS-3/EC-2/RS-3, CarboCoke, Petroleum Coke, etc.' },
        { label: 'Bag Size / Container',          type: 'Text',       required: 'NO',  sync: 'PM-entered',      note: 'e.g. 50 lb bag. Used to compute coke weight on ground bed form.' },
        { label: 'Planned Bag Quantity',          type: 'Integer',    required: 'YES', sync: 'PM-entered',      note: 'Planned number of bags to use.' },
        { label: 'Active (per bag size)',         type: 'Toggle',     required: 'NO',  sync: 'PM-entered',      note: 'Marks which coke bag entries are active / in use.' },
        { label: 'Actual Bag Quantity (mobile)',  type: 'Calculated', required: 'NO',  sync: 'Mobile → DB',     note: 'Read-only. Entered by field crew on Ground Bed mobile form.' },
        { label: 'Coke Weight (calculated)',      type: 'Calculated', required: 'NO',  sync: 'Auto-calculated', note: 'Bags × unit weight. Shown read-only on form and PDF.' },
      ],
    },
    {
      title: 'Cement / Plug',
      stepNote: 'Conditional section — only shown when plug is required. Gates further inputs.',
      fields: [
        { label: 'Include Cement Plug? (Yes/No)', type: 'Toggle',     required: 'NO',  sync: 'PM-entered',      note: 'When No, all cement plug fields are hidden and not required.' },
        { label: 'Plug Depth (ft)',               type: 'Text',       required: 'COND',sync: 'PM-entered',      note: 'Shown when plug = Yes. Can be a range e.g. 325\'–225\'.' },
        { label: 'Plug Length (ft)',              type: 'Decimal',    required: 'COND',sync: 'PM-entered' },
        { label: 'Plug Type',                     type: 'Picker',     required: 'COND',sync: 'PM-entered',      note: 'Portland Type 1/2/3, High Early, Bentonite Grout, N/A, Other.' },
      ],
    },
    {
      title: 'Casing & Vent',
      stepNote: 'Casing dimensions and vent pipe configuration. Vent length auto-calculates when possible.',
      fields: [
        { label: 'Casing Length (ft)',            type: 'Decimal',    required: 'NO',  sync: 'PM-entered',      note: 'Drives casing zone height on ground bed schematic.' },
        { label: 'Casing Diameter (in)',          type: 'Text',       required: 'NO',  sync: 'PM-entered',      note: 'Bore diameter. Shows on schematic label.' },
        { label: 'Casing Grout',                  type: 'Text',       required: 'NO',  sync: 'PM-entered' },
        { label: 'Vent Type',                     type: 'Picker',     required: 'NO',  sync: 'PM-entered',      note: 'PVC / AllVent / N/A.' },
        { label: 'Vent Size',                     type: 'Picker',     required: 'COND',sync: 'PM-entered',      note: 'AllVent: 1" / 1.25" / 2". PVC: text entry.' },
        { label: 'Vent Length (ft)',              type: 'Calculated', required: 'COND',sync: 'Auto-calculated', note: 'AllVent: equals Top of Coke (auto-calc). PVC: manual entry. Drives schematic height.' },
        { label: 'Double Vented',                 type: 'Toggle',     required: 'NO',  sync: 'PM-entered',      note: 'When on, schematic draws two vent pipes side by side.' },
      ],
    },
    {
      title: 'Wiring & Equipment',
      stepNote: 'Shunt pickers for rectifier, RMU, and junction boxes. Values pre-fill the Rectifier mobile form.',
      fields: [
        { label: 'Rectifier shunt',               type: '2-Tier Picker (Shunt)', required: 'NO', sync: 'PM-entered', note: 'Brand → Model picker. Pre-fills Rectifier Report shunt fields on mobile.' },
        { label: 'RMU model',                     type: 'Combo Picker', required: 'NO', sync: 'PM-entered',    note: 'Pre-fills RMU section in Rectifier mobile form.' },
        { label: 'Anode J-Box shunt',             type: '2-Tier Picker (Shunt)', required: 'NO', sync: 'PM-entered', note: 'Pre-fills anode output shunt selection on mobile Rectifier.' },
        { label: 'Neg J-Box shunt',               type: '2-Tier Picker (Shunt)', required: 'NO', sync: 'PM-entered', note: 'Pre-fills negative connection shunt selection on mobile Rectifier.' },
        { label: 'Logging Volts',                 type: 'Decimal',    required: 'NO',  sync: 'PM-entered',      note: 'Pre-fills logging voltage on Ground Bed mobile form. Drives ohms calculation.' },
        { label: 'Logging Instrument',            type: 'Picker',     required: 'NO',  sync: 'PM-entered',      note: 'Anode type used for logging. Pre-fills Ground Bed logging step.' },
      ],
    },
    {
      title: 'Ground Bed Geometry',
      stepNote: 'Positioning inputs that drive anode depth auto-calc and schematic rendering on the Ground Bed form.',
      fields: [
        { label: 'Hole Depth (ft)',               type: 'Decimal',    required: 'YES', sync: 'PM-entered',      note: 'Total drilled depth. Drives drilling log row count on mobile.' },
        { label: 'Interval (ft)',                 type: 'Decimal',    required: 'YES', sync: 'PM-entered',      note: 'Depth per log row. Row count = Depth ÷ Interval.' },
        { label: 'Diameter (in)',                 type: 'Picker',     required: 'NO',  sync: 'PM-entered',      note: '6 / 8 / 10 / 12 / 14 in.' },
        { label: 'Spacing from Bottom (B, ft)',   type: 'Decimal',    required: 'NO',  sync: 'PM-entered',      note: 'Distance from hole bottom to first anode CL. Required for schematic.' },
        { label: 'Anode Spacing CL (S, ft)',      type: 'Decimal',    required: 'NO',  sync: 'PM-entered',      note: 'Centre-to-centre distance between anodes. Required for schematic.' },
        { label: 'Top of Coke (ft)',              type: 'Decimal',    required: 'YES', sync: 'PM-entered',      note: 'Depth at which coke backfill starts. Drives schematic coke column.' },
        { label: 'Bentonite Plug depth (ft)',     type: 'Decimal',    required: 'NO',  sync: 'PM-entered',      note: 'Surface seal depth. Shown on schematic as bentonite zone.' },
        { label: 'Pea Gravel depth (ft)',         type: 'Decimal',    required: 'COND',sync: 'PM-entered',      note: 'Shown when Fill Material = Pea Gravel or Other. Drives fill zone on schematic.' },
      ],
    },
    {
      title: 'Equipment (Rental Planning)',
      stepNote: 'Rental equipment planned for the site. Displayed as read-only context on mobile Daily form.',
      fields: [
        { label: 'Equipment type / description',  type: 'Text',       required: 'NO',  sync: 'PM-entered' },
        { label: 'Planned quantity',              type: 'Integer',    required: 'NO',  sync: 'PM-entered' },
        { label: 'Actual quantity (mobile)',      type: 'Calculated', required: 'NO',  sync: 'Mobile → DB', note: 'Read-only. Entered by field crew on Daily mobile form.' },
        { label: 'Field-added equipment flag',    type: 'Calculated', required: 'NO',  sync: 'Mobile → DB', note: 'Items added by field crew not in the plan are flagged for PM review.' },
      ],
    },
    {
      title: 'Disposal',
      stepNote: 'Waste disposal planning for the site.',
      fields: [
        { label: 'Disposal method',               type: 'Picker',     required: 'NO',  sync: 'PM-entered',      note: 'On-Site / Off-Site.' },
        { label: 'Oil Field Vac',                 type: 'Toggle',     required: 'NO',  sync: 'PM-entered' },
        { label: '70BBL',                         type: 'Toggle',     required: 'NO',  sync: 'PM-entered' },
        { label: 'Notes',                         type: 'Multiline',  required: 'NO',  sync: 'PM-entered' },
      ],
    },
    {
      title: 'Materials Plan (Planned vs Actuals)',
      stepNote: 'Summarised materials plan table showing planned quantities from PM and actuals from mobile submissions.',
      fields: [
        { label: 'Plan rows display',             type: 'Table',      required: 'NO',  sync: 'PM-entered',      note: 'Each row: Material Name, UOM, Planned Qty, Actual Qty, Variance.' },
        { label: 'Planned Qty — read-only on mobile', type: 'Calculated', required: 'NO', sync: 'PM → mobile', note: 'Mobile shows planned as context only. Not editable by field crew.' },
        { label: 'Actual Qty — populated from mobile', type: 'Calculated', required: 'NO', sync: 'Mobile → DB', note: 'Aggregated from material_ques table via fn_get_site_materials_plan.' },
        { label: 'Variance display',              type: 'Calculated', required: 'NO',  sync: 'Auto-calculated', note: 'Planned − Actual. Shown as number. Negative = crew used more than planned.' },
        { label: 'Field-added material rows',     type: 'Calculated', required: 'NO',  sync: 'Mobile → DB',     note: 'Items added by crew not in plan. Flagged for PM review. IsFieldAdded = true.' },
      ],
    },
    {
      title: 'Required Documents / Forms',
      stepNote: 'Checklist of forms required to be completed for this site before site can move to Complete status.',
      fields: [
        { label: 'Required form list display',    type: 'Table',      required: 'NO',  sync: 'PM-configured',   note: 'PM sets which forms are required. Mobile shows requirement status.' },
        { label: 'Skip with reason',              type: 'Button',     required: 'NO',  sync: 'Mobile action',   note: 'Field crew can skip a required form with a reason logged.' },
        { label: 'Completion status display',     type: 'Calculated', required: 'NO',  sync: 'Auto-calculated', note: 'Each requirement shows pending/complete/skipped.' },
      ],
    },
  ],
}

// ── Export ────────────────────────────────────────────────────────────────────

export const FORMS: FormDef[] = [daily, tlreport, negative, rectifier, groundbed, drawing, materials]

export function getForm(id: string): FormDef | undefined {
  return FORMS.find(f => f.id === id)
}
