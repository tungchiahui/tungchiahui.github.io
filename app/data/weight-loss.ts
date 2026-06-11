export interface WeightMilestone {
  stage: number
  date: string
  min: number
  max: number
}

export interface WeightRecord {
  date: string
  targetMin: number
  targetMax: number
  weight: string
  bodyFat: string
  muscleMass: string
  waist: string
  note: string
}

export interface WeightImportResult {
  imported: number
  skipped: number
}

export const START_WEIGHT = 98
export const GOAL_WEIGHT = 75
export const PLAN_START_DATE = '2026-06-11'
export const PLAN_END_DATE = '2027-02-04'

export const weightMilestones: WeightMilestone[] = [
  { stage: 0, date: '2026-06-11', min: 98, max: 98 },
  { stage: 1, date: '2026-06-25', min: 96, max: 96.5 },
  { stage: 2, date: '2026-07-09', min: 94, max: 95 },
  { stage: 3, date: '2026-07-23', min: 92.5, max: 93.5 },
  { stage: 4, date: '2026-08-06', min: 91, max: 92 },
  { stage: 5, date: '2026-08-20', min: 89.5, max: 90.5 },
  { stage: 6, date: '2026-09-03', min: 88, max: 89.5 },
  { stage: 7, date: '2026-09-17', min: 86.5, max: 88 },
  { stage: 8, date: '2026-10-01', min: 85, max: 86.5 },
  { stage: 9, date: '2026-10-15', min: 83.5, max: 85 },
  { stage: 10, date: '2026-10-29', min: 82, max: 83.5 },
  { stage: 11, date: '2026-11-12', min: 80.5, max: 82 },
  { stage: 12, date: '2026-11-26', min: 79, max: 80.5 },
  { stage: 13, date: '2026-12-10', min: 78, max: 79.5 },
  { stage: 14, date: '2026-12-24', min: 77, max: 78.5 },
  { stage: 15, date: '2027-01-07', min: 76, max: 77.5 },
  { stage: 16, date: '2027-01-21', min: 75, max: 76.5 },
  { stage: 17, date: '2027-02-04', min: 74.5, max: 75.5 }
]

export function createWeeklyRecords(): WeightRecord[] {
  const records: WeightRecord[] = []
  const start = parseIsoDate(PLAN_START_DATE)
  const end = parseIsoDate(PLAN_END_DATE)

  for (let cursor = start; cursor <= end; cursor += 7 * 24 * 60 * 60 * 1000) {
    const date = toIsoDate(cursor)
    const target = getTargetRange(date)

    records.push({
      date,
      targetMin: target.min,
      targetMax: target.max,
      weight: date === PLAN_START_DATE ? String(START_WEIGHT) : '',
      bodyFat: '',
      muscleMass: '',
      waist: '',
      note: ''
    })
  }

  return records
}

export function importWeightRecordsFromCsv(csv: string, records: WeightRecord[]): WeightImportResult {
  const rows = parseCsv(csv.replace(/^\uFEFF/, ''))
  if (!rows) return { imported: 0, skipped: 0 }

  const recordByDate = new Map(records.map(record => [record.date, record]))
  const importedDates = new Set<string>()
  let skipped = 0

  for (const [index, row] of rows.entries()) {
    if (row.every(cell => !cell.trim())) continue

    const date = row[0]?.trim() || ''
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      if (index > 0) skipped += 1
      continue
    }

    if (row.length < 7) {
      skipped += 1
      continue
    }

    const record = recordByDate.get(date)
    const weight = readCsvNumber(row[2], 35, 250)
    const bodyFat = readCsvNumber(row[3], 2, 70)
    const muscleMass = readCsvNumber(row[4], 10, 100)
    const waist = readCsvNumber(row[5], 40, 200)

    if (!record || !weight.valid || !bodyFat.valid || !muscleMass.valid || !waist.valid) {
      skipped += 1
      continue
    }

    record.weight = weight.value
    record.bodyFat = bodyFat.value
    record.muscleMass = muscleMass.value
    record.waist = waist.value
    record.note = row[6] || ''
    importedDates.add(date)
  }

  return { imported: importedDates.size, skipped }
}

export function getTargetRange(date: string) {
  const timestamp = parseIsoDate(date)
  const first = weightMilestones[0]!
  const last = weightMilestones[weightMilestones.length - 1]!

  if (timestamp <= parseIsoDate(first.date)) return { min: first.min, max: first.max }
  if (timestamp >= parseIsoDate(last.date)) return { min: last.min, max: last.max }

  const nextIndex = weightMilestones.findIndex(item => parseIsoDate(item.date) >= timestamp)
  const previous = weightMilestones[nextIndex - 1]!
  const next = weightMilestones[nextIndex]!
  const previousTime = parseIsoDate(previous.date)
  const nextTime = parseIsoDate(next.date)
  const progress = (timestamp - previousTime) / (nextTime - previousTime)

  return {
    min: roundToTenth(previous.min + (next.min - previous.min) * progress),
    max: roundToTenth(previous.max + (next.max - previous.max) * progress)
  }
}

export function parseIsoDate(value: string) {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export function toIsoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10)
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10
}

function parseCsv(csv: string): string[][] | null {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]

    if (quoted) {
      if (character === '"') {
        if (csv[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          quoted = false
        }
      } else {
        field += character
      }
      continue
    }

    if (character === '"') {
      quoted = true
    } else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (character !== '\r') {
      field += character
    }
  }

  if (quoted) return null
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

function readCsvNumber(value: string | undefined, min: number, max: number) {
  const text = (value || '').trim()
  if (!text) return { valid: true, value: '' }

  const number = Number(text)
  return {
    valid: Number.isFinite(number) && number >= min && number <= max,
    value: text
  }
}
