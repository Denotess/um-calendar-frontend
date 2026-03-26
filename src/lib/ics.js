function unfoldIcsLines(icsText) {
  const normalized = icsText.replace(/\r\n/g, '\n')
  const rawLines = normalized.split('\n')
  const lines = []

  for (const line of rawLines) {
    if (!line) {
      continue
    }

    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.trimStart()
      continue
    }

    lines.push(line)
  }

  return lines
}

function parseIcsDate(value) {
  if (!value) {
    return null
  }

  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4))
    const month = Number(value.slice(4, 6)) - 1
    const day = Number(value.slice(6, 8))
    return new Date(year, month, day)
  }

  const isUtc = value.endsWith('Z')
  const clean = value.replace('Z', '')

  if (!/^\d{8}T\d{6}$/.test(clean)) {
    return null
  }

  const year = Number(clean.slice(0, 4))
  const month = Number(clean.slice(4, 6)) - 1
  const day = Number(clean.slice(6, 8))
  const hour = Number(clean.slice(9, 11))
  const minute = Number(clean.slice(11, 13))
  const second = Number(clean.slice(13, 15))

  if (isUtc) {
    return new Date(Date.UTC(year, month, day, hour, minute, second))
  }

  return new Date(year, month, day, hour, minute, second)
}

function parseProperty(line) {
  const separatorIndex = line.indexOf(':')
  if (separatorIndex < 0) {
    return null
  }

  const keyPart = line.slice(0, separatorIndex)
  const value = line.slice(separatorIndex + 1)

  return {
    key: keyPart.split(';')[0],
    value,
  }
}

export function parseIcsEvents(icsText) {
  const lines = unfoldIcsLines(icsText)
  const events = []
  let current = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {}
      continue
    }

    if (line === 'END:VEVENT') {
      if (current?.start) {
        events.push({
          uid: current.uid ?? `${current.summary ?? 'event'}-${current.start.toISOString()}`,
          summary: current.summary ?? 'Untitled Event',
          description: current.description ?? '',
          location: current.location ?? '',
          start: current.start,
          end: current.end ?? current.start,
        })
      }

      current = null
      continue
    }

    if (!current) {
      continue
    }

    const prop = parseProperty(line)
    if (!prop) {
      continue
    }

    if (prop.key === 'UID') {
      current.uid = prop.value
    } else if (prop.key === 'SUMMARY') {
      current.summary = prop.value
    } else if (prop.key === 'DESCRIPTION') {
      current.description = prop.value.replace(/\\n/g, '\n')
    } else if (prop.key === 'LOCATION') {
      current.location = prop.value
    } else if (prop.key === 'DTSTART') {
      current.start = parseIcsDate(prop.value)
    } else if (prop.key === 'DTEND') {
      current.end = parseIcsDate(prop.value)
    }
  }

  return events.sort((a, b) => a.start - b.start)
}

export function extractGroupName(calendarName) {
  if (!calendarName) {
    return 'Other'
  }

  if (calendarName.includes('---')) {
    const group = calendarName.split('---')[0].trim()
    return group || 'Other'
  }

  const match = calendarName.match(/^([^\-]+)/)
  return (match?.[1] ?? 'Other').trim()
}
