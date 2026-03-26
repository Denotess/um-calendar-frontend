export const ACTIVITY_TYPE_DEFINITIONS = [
  {
    key: 'exam',
    label: 'Izpit/Kolokvij',
    color: '#ef4444',
    patterns: [/\bizpit\b/i, /\bkolokvij\b/i],
  },
  {
    key: 'lecture-online',
    label: 'e-Predavanje',
    color: '#f59e0b',
    patterns: [/^\s*e[\s-]?p[\s:.-]/i, /\be[-\s]?predavanje\b/i],
  },
  {
    key: 'lecture',
    label: 'Predavanje',
    color: '#3b82f6',
    patterns: [/^\s*p[\s:.-]/i, /\bpredavanje\b/i],
  },
  {
    key: 'practice-online',
    label: 'e-Vaje',
    color: '#a855f7',
    patterns: [/^\s*e[\s-]?v[\s:.-]/i, /\be[-\s]?vaje\b/i],
  },
  {
    key: 'practice',
    label: 'Vaje',
    color: '#22c55e',
    patterns: [/^\s*v[\s:.-]/i, /\bvaje\b/i],
  },
]

export const UNDEFINED_ACTIVITY_TYPE = {
  key: 'undefined',
  label: 'Undefined',
  color: '#94a3b8',
}

export function detectActivityType(summary) {
  const title = (summary ?? '').toLowerCase()

  for (const definition of ACTIVITY_TYPE_DEFINITIONS) {
    if (definition.patterns.some((pattern) => pattern.test(title))) {
      return definition
    }
  }

  return UNDEFINED_ACTIVITY_TYPE
}

export function getActivityTypeByKey(key) {
  if (key === 'undefined') {
    return UNDEFINED_ACTIVITY_TYPE
  }

  return ACTIVITY_TYPE_DEFINITIONS.find((definition) => definition.key === key) ?? null
}
