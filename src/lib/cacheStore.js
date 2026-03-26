import { reactive } from 'vue'

const STORAGE_KEY = 'um-calendar-cache-v1'

const defaults = {
  colorMode: 'dark',
  selectedGroup: 'All Groups',
  selectedActivityType: 'all',
  selectedCalendar: '',
  cachedNames: [],
  namesFetchedAt: 0,
  cachedCalendarIcs: {},
}

function loadState() {
  if (typeof localStorage === 'undefined') {
    return { ...defaults }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...defaults }
    }

    const parsed = JSON.parse(raw)
    return {
      ...defaults,
      ...parsed,
      cachedNames: Array.isArray(parsed.cachedNames) ? parsed.cachedNames : [],
      namesFetchedAt: Number.isFinite(parsed.namesFetchedAt) ? parsed.namesFetchedAt : 0,
      cachedCalendarIcs:
        parsed.cachedCalendarIcs && typeof parsed.cachedCalendarIcs === 'object'
          ? parsed.cachedCalendarIcs
          : {},
    }
  } catch {
    return { ...defaults }
  }
}

const state = reactive(loadState())

function persist() {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      colorMode: state.colorMode,
      selectedGroup: state.selectedGroup,
      selectedActivityType: state.selectedActivityType,
      selectedCalendar: state.selectedCalendar,
      cachedNames: state.cachedNames,
      namesFetchedAt: state.namesFetchedAt,
      cachedCalendarIcs: state.cachedCalendarIcs,
    }),
  )
}

export function useCacheStore() {
  const setColorMode = (mode) => {
    state.colorMode = mode
    persist()
  }

  const setSelectedGroup = (group) => {
    state.selectedGroup = group
    persist()
  }

  const setSelectedActivityType = (activityType) => {
    state.selectedActivityType = activityType
    persist()
  }

  const setSelectedCalendar = (name) => {
    state.selectedCalendar = name
    persist()
  }

  const setCachedNames = (names) => {
    state.cachedNames = names
    state.namesFetchedAt = Date.now()
    persist()
  }

  const setCachedCalendarIcs = (calendarName, ics) => {
    if (!calendarName || !ics) {
      return
    }

    state.cachedCalendarIcs = {
      ...state.cachedCalendarIcs,
      [calendarName]: {
        ics,
        fetchedAt: Date.now(),
      },
    }
    persist()
  }

  const getCachedCalendarIcs = (calendarName) => {
    if (!calendarName) {
      return null
    }

    const entry = state.cachedCalendarIcs?.[calendarName]
    if (!entry || typeof entry.ics !== 'string') {
      return null
    }

    return entry.ics
  }

  return {
    state,
    setColorMode,
    setSelectedGroup,
    setSelectedActivityType,
    setSelectedCalendar,
    setCachedNames,
    setCachedCalendarIcs,
    getCachedCalendarIcs,
  }
}
