<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import DropdownSelect from './components/DropdownSelect.vue'
import ColorFilterBar from './components/ColorFilterBar.vue'
import { useCacheStore } from './lib/cacheStore'
import { fetchCalendarIcs, fetchCalendarNames } from './lib/calendarApi'
import { parseIcsEvents } from './lib/ics'
import {
  ACTIVITY_TYPE_DEFINITIONS,
  UNDEFINED_ACTIVITY_TYPE,
  detectActivityType,
  getActivityTypeByKey,
} from './lib/activityTypes'

const cache = useCacheStore()
const loading = ref(false)
const loadingEvents = ref(false)
const error = ref('')
const currentView = ref('daily')
const allNames = ref([])
const events = ref([])
const currentDate = ref(new Date())
const nowTick = ref(new Date())
let nowIntervalId = null

const uiMode = computed({
  get: () => cache.state.colorMode,
  set: (mode) => cache.setColorMode(mode),
})

const selectedGroup = computed({
  get: () => cache.state.selectedGroup,
  set: (group) => cache.setSelectedGroup(group),
})

const selectedCalendar = computed({
  get: () => cache.state.selectedCalendar,
  set: (calendar) => cache.setSelectedCalendar(calendar),
})

const selectedActivityType = computed({
  get: () => cache.state.selectedActivityType,
  set: (activityType) => cache.setSelectedActivityType(activityType),
})

const groupOptions = computed(() => [
  'No filter',
  '1.skupina',
  '2.skupina',
  '3.skupina',
  '4.skupina',
  '5.skupina',
])

const hourSlots = computed(() => {
  const slots = []
  for (let hour = 7; hour <= 21; hour += 1) {
    slots.push(hour)
  }
  return slots
})

const calendarOptions = computed(() => {
  return [...allNames.value]
})

const navigationTitle = computed(() => {
  if (currentView.value === 'weekly') {
    return `Week ${isoWeekNumber(currentDate.value)}`
  }

  if (currentView.value === 'monthly') {
    return monthTitle(currentDate.value)
  }

  return formatDayTitle(currentDate.value)
})

const navigationSubtitle = computed(() => {
  if (currentView.value === 'weekly') {
    return formatWeekRange(currentDate.value).toUpperCase()
  }

  if (currentView.value === 'monthly') {
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    })
      .format(currentDate.value)
      .toUpperCase()
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
    .format(currentDate.value)
    .toUpperCase()
})

const isTodaySelected = computed(() => isSameDay(currentDate.value, new Date()))
const isDarkMode = computed(() => uiMode.value === 'dark')

const activityFilterOptions = computed(() => [
  { key: 'all', label: 'All Activities', color: '#00cffc' },
  ...ACTIVITY_TYPE_DEFINITIONS.map(({ key, label, color }) => ({ key, label, color })),
  UNDEFINED_ACTIVITY_TYPE,
])

const todayEvents = computed(() => {
  const date = currentDate.value
  return events.value.filter((event) => isSameDay(event.start, date))
})

const weekDays = computed(() => {
  const start = startOfWeek(currentDate.value)
  const days = []

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)

    days.push({
      date,
      events: events.value.filter((event) => isSameDay(event.start, date)),
    })
  }

  return days
})

const monthCells = computed(() => {
  const monthStart = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  const firstCell = startOfWeek(monthStart)
  const cells = []

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(firstCell)
    date.setDate(firstCell.getDate() + i)
    const dayEvents = events.value.filter((event) => isSameDay(event.start, date))
    const uniqueTypeColors = []

    for (const event of dayEvents) {
      const color = activityTypeColor(event)
      if (!uniqueTypeColors.includes(color)) {
        uniqueTypeColors.push(color)
      }
    }

    cells.push({
      date,
      inMonth: date.getMonth() === currentDate.value.getMonth(),
      count: dayEvents.length,
      dotColors: uniqueTypeColors.slice(0, 3),
      extraCount: Math.max(uniqueTypeColors.length - 3, 0),
    })
  }

  return cells
})

watch(
  () => uiMode.value,
  (mode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  },
  { immediate: true },
)

watch(
  () => groupOptions.value,
  (options) => {
    if (!options.includes(selectedGroup.value)) {
      selectedGroup.value = options[0]
    }
  },
  { immediate: true },
)

watch(
  () => activityFilterOptions.value,
  (options) => {
    const keys = options.map((option) => option.key)
    if (!keys.includes(selectedActivityType.value)) {
      selectedActivityType.value = 'all'
    }
  },
  { immediate: true },
)

watch(
  () => calendarOptions.value,
  (options) => {
    if (!options.length) {
      return
    }

    if (!options.includes(selectedCalendar.value)) {
      selectedCalendar.value = options[0]
    }
  },
  { immediate: true },
)

watch(
  () => selectedCalendar.value,
  async (calendar) => {
    if (!calendar) {
      events.value = []
      return
    }

    loadingEvents.value = true
    error.value = ''

    const cachedIcs = cache.getCachedCalendarIcs(calendar)
    if (cachedIcs) {
      events.value = parseIcsEvents(cachedIcs)
    }

    try {
      const ics = await fetchCalendarIcs(calendar)
      events.value = parseIcsEvents(ics)
      cache.setCachedCalendarIcs(calendar, ics)
    } catch (err) {
      if (!cachedIcs) {
        error.value = err instanceof Error ? err.message : 'Unable to load calendar data'
        events.value = []
      } else {
        error.value = 'Offline mode: showing cached calendar data'
      }
    } finally {
      loadingEvents.value = false
    }
  },
  { immediate: true },
)

onMounted(async () => {
  nowIntervalId = window.setInterval(() => {
    nowTick.value = new Date()
  }, 60000)

  loading.value = true

  const namesAreFresh =
    Array.isArray(cache.state.cachedNames) &&
    cache.state.cachedNames.length > 0 &&
    Date.now() - cache.state.namesFetchedAt < 1000 * 60 * 60 * 6

  if (namesAreFresh) {
    allNames.value = cache.state.cachedNames
    loading.value = false
    return
  }

  try {
    const names = await fetchCalendarNames()
    allNames.value = names
    cache.setCachedNames(names)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load calendar list'
    allNames.value = cache.state.cachedNames
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (nowIntervalId) {
    window.clearInterval(nowIntervalId)
    nowIntervalId = null
  }
})

function setView(view) {
  currentView.value = view
}

function setDateOffset(days) {
  const next = new Date(currentDate.value)
  next.setDate(next.getDate() + days)
  currentDate.value = next
}

function moveDateByView(direction) {
  if (currentView.value === 'weekly') {
    setDateOffset(7 * direction)
    return
  }

  if (currentView.value === 'monthly') {
    const next = new Date(currentDate.value)
    next.setMonth(next.getMonth() + direction)
    currentDate.value = next
    return
  }

  setDateOffset(direction)
}

function resetToday() {
  currentDate.value = new Date()
}

function openDayFromWeek(date) {
  currentDate.value = new Date(date)
  currentView.value = 'daily'
}

function openDayFromMonth(date) {
  currentDate.value = new Date(date)
  currentView.value = 'daily'
}

function toggleMode() {
  uiMode.value = uiMode.value === 'dark' ? 'light' : 'dark'
}

function setGroup(group) {
  selectedGroup.value = group
}

function eventTime(event) {
  const start = formatTime(event.start)
  const end = formatTime(event.end)
  return `${start} - ${end}`
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatDayTitle(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function monthTitle(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function startOfWeek(date) {
  const copy = new Date(date)
  const day = copy.getDay()
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function eventMatchesGroup(event, selected) {
  if (selected === 'No filter') {
    return true
  }

  return getEventGroupLabel(event) === selected
}

function getEventGroupLabel(event) {
  const title = (event.summary ?? '').toLowerCase()

  const numberFirst = title.match(/\b(\d+)[\.\s-]*(skupina|group)\b/i)
  if (numberFirst?.[1]) {
    return `${numberFirst[1]}.skupina`
  }

  const wordFirst = title.match(/\b(skupina|group)[\.\s-]*(\d+)\b/i)
  if (wordFirst?.[2]) {
    return `${wordFirst[2]}.skupina`
  }

  return 'General'
}

function isEventDimmed(event) {
  const groupMismatch = !eventMatchesGroup(event, selectedGroup.value)
  const activityMismatch =
    selectedActivityType.value !== 'all' && eventActivityType(event).key !== selectedActivityType.value

  return groupMismatch || activityMismatch
}

function eventActivityType(event) {
  return detectActivityType(event.summary)
}

function activityTypeLabel(event) {
  return eventActivityType(event).label
}

function activityTypeColor(event) {
  return eventActivityType(event).color
}

function selectedActivityLabel() {
  if (selectedActivityType.value === 'all') {
    return 'All Activities'
  }

  return getActivityTypeByKey(selectedActivityType.value)?.label ?? 'Undefined'
}

function eventsForHour(hour) {
  return todayEvents.value.filter((event) => event.start.getHours() === hour)
}

function hourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`
}

function nowLabel() {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(nowTick.value)
}

function isNowHour(hour) {
  return isSameDay(currentDate.value, nowTick.value) && nowTick.value.getHours() === hour
}

function isCurrentDay(date) {
  return isSameDay(date, nowTick.value)
}

function isoWeekNumber(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  return Math.ceil(((target - yearStart) / 86400000 + 1) / 7)
}

function formatWeekRange(date) {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const startMonth = new Intl.DateTimeFormat(undefined, { month: 'short' }).format(start)
  const endMonth = new Intl.DateTimeFormat(undefined, { month: 'short' }).format(end)
  const startDay = start.getDate()
  const endDay = end.getDate()
  const endYear = end.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${endYear}`
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`
}
</script>

<template>
  <div
    class="min-h-screen transition-colors"
    :class="isDarkMode ? 'bg-[#060e20] text-[#dee5ff]' : 'bg-[#f7f8fb] text-[#1b243a]'"
  >
    <header
      class="sticky top-0 z-20 border-b px-4 py-3 backdrop-blur transition-colors"
      :class="isDarkMode ? 'border-[#192540] bg-[#060e20]/95' : 'border-[#dbe3ef] bg-[#f7f8fb]/95'"
    >
      <div class="mx-auto flex max-w-md items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[#00cffc]">calendar_today</span>
          <h1 class="text-xl font-bold tracking-tight" :class="isDarkMode ? 'text-[#dee5ff]' : 'text-[#1b243a]'">UM Calendar</h1>
        </div>
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full transition"
          :class="
            isDarkMode
              ? 'bg-[#141f38] text-[#69daff] shadow-[0_0_18px_rgba(105,218,255,0.12)] hover:bg-[#192540]'
              : 'bg-[#e8f6ff] text-[#006880] shadow-[0_0_10px_rgba(0,102,128,0.18)] hover:bg-[#d6effd]'
          "
          @click="toggleMode"
        >
          <span class="material-symbols-outlined text-base">{{ uiMode === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
        </button>
      </div>
    </header>

    <main class="mx-auto flex max-w-md flex-col gap-4 px-4 py-4 pb-28">
      <section class="pt-8 pb-6 text-center">
        <h2 class="mb-1 text-4xl font-extrabold tracking-tighter" :class="isDarkMode ? 'text-[#dee5ff]' : 'text-[#1b243a]'">
          {{ navigationTitle }}
        </h2>
        <p class="text-sm font-medium tracking-widest uppercase" :class="isDarkMode ? 'text-[#a3aac4]' : 'text-[#607089]'">
          {{ navigationSubtitle }}
        </p>
      </section>

      <section class="mb-8 flex justify-center">
        <div
          class="flex items-center gap-4 rounded-full p-1.5 transition-colors"
          :class="isDarkMode ? 'bg-[#091328]' : 'bg-[#e5edf8]'
          "
        >
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            :class="isDarkMode ? 'text-[#a3aac4] hover:bg-[#141f38]' : 'text-[#607089] hover:bg-[#d5e2f2]'"
            @click="moveDateByView(-1)"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>

          <button
            type="button"
            class="rounded-full px-6 py-2 text-sm font-bold tracking-wide transition"
            :class="
              isTodaySelected
                ? isDarkMode
                  ? 'bg-[#69daff] text-[#004a5d] shadow-lg shadow-[#69daff]/20'
                  : 'bg-[#45cfff] text-[#004a5d] shadow-lg shadow-[#45cfff]/25'
                : isDarkMode
                  ? 'bg-[#141f38] text-[#a3aac4]'
                  : 'bg-[#cdd9ea] text-[#5c6f8a]'
            "
            @click="resetToday"
          >
            TODAY
          </button>

          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            :class="isDarkMode ? 'text-[#a3aac4] hover:bg-[#141f38]' : 'text-[#607089] hover:bg-[#d5e2f2]'"
            @click="moveDateByView(1)"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>

      <section
        class="grid grid-cols-1 gap-3 rounded-3xl border p-4 transition-colors"
        :class="
          isDarkMode
            ? 'border-[#192540] bg-[#0f1930] shadow-[0_0_30px_rgba(105,218,255,0.08)]'
            : 'border-[#dbe3ef] bg-white shadow-[0_0_20px_rgba(8,65,110,0.08)]'
        "
      >
        <div>
          <p class="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#7b8193] dark:text-[#a3aac4]">
            Group Selection
          </p>
          <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              v-for="group in groupOptions"
              :key="group"
              type="button"
              class="whitespace-nowrap rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide transition"
              :class="
                selectedGroup === group
                  ? isDarkMode
                    ? 'bg-[#69daff] text-[#004a5d] shadow-[0_0_16px_rgba(105,218,255,0.25)]'
                    : 'bg-[#45cfff] text-[#004a5d] shadow-[0_0_10px_rgba(69,207,255,0.22)]'
                  : isDarkMode
                    ? 'bg-[#141f38] text-[#a3aac4] hover:bg-[#192540]'
                    : 'bg-[#edf2f7] text-[#56617a] hover:bg-[#e2e9f3]'
              "
              @click="setGroup(group)"
            >
              {{ group }}
            </button>
          </div>
        </div>

        <DropdownSelect
          v-model="selectedCalendar"
          label="Calendar Selection"
          :options="calendarOptions"
          placeholder="Select calendar"
        />

        <ColorFilterBar
          v-model="selectedActivityType"
          label="Activity Color Filter"
          :options="activityFilterOptions"
        />

        <p v-if="loading" class="text-xs text-[#7b8193] dark:text-[#a3aac4]">Loading calendars...</p>
        <p v-if="error" class="text-xs font-semibold text-red-500">{{ error }}</p>
      </section>

      <section
        v-if="loadingEvents"
        class="rounded-3xl border p-4 text-sm transition-colors"
        :class="
          isDarkMode
            ? 'border-[#192540] bg-[#0f1930] text-[#a3aac4] shadow-[0_0_24px_rgba(105,218,255,0.06)]'
            : 'border-[#dbe3ef] bg-white text-[#607089] shadow-[0_0_16px_rgba(8,65,110,0.08)]'
        "
      >
        Loading events...
      </section>

      <section
        v-if="currentView === 'daily'"
        class="rounded-3xl border p-4 transition-colors"
        :class="
          isDarkMode
            ? 'border-[#192540] bg-[#0f1930] shadow-[0_0_30px_rgba(105,218,255,0.08)]'
            : 'border-[#dbe3ef] bg-white shadow-[0_0_20px_rgba(8,65,110,0.08)]'
        "
      >
        <div class="space-y-5">
          <div v-for="hour in hourSlots" :key="hour" class="flex gap-3">
            <div class="w-12 pt-1 text-right">
              <span class="text-[11px] font-bold text-[#7b8193] dark:text-[#a3aac4]">{{ hourLabel(hour) }}</span>
            </div>

            <div class="flex-1">
              <div class="mb-2 h-px" :class="isDarkMode ? 'bg-[#192540]' : 'bg-[#dbe3ef]'"></div>

              <div v-if="isNowHour(hour)" class="mb-2 flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-widest text-[#69daff]">Now {{ nowLabel() }}</span>
                <div class="h-0.5 flex-1 rounded-full bg-[#69daff] shadow-[0_0_10px_rgba(105,218,255,0.7)]"></div>
                <span
                  class="material-symbols-outlined text-sm text-[#69daff]"
                  style="font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20"
                >
                  radio_button_checked
                </span>
              </div>

              <div class="space-y-2">
                <article
                  v-for="event in eventsForHour(hour)"
                  :key="event.uid"
                  class="rounded-2xl border-l-4 p-3 transition"
                  :class="
                    [
                      isDarkMode
                        ? 'bg-[#141f38] shadow-[0_0_18px_rgba(105,218,255,0.08)] hover:shadow-[0_0_22px_rgba(105,218,255,0.16)]'
                        : 'bg-[#f6f9fd] shadow-[0_0_12px_rgba(8,65,110,0.08)] hover:shadow-[0_0_16px_rgba(8,65,110,0.14)]',
                      isEventDimmed(event) ? 'opacity-45 blur-[0.4px]' : '',
                    ]
                  "
                  :style="{ borderLeftColor: activityTypeColor(event) }"
                >
                  <p class="mb-1 text-[10px] font-black uppercase tracking-widest text-[#006880] dark:text-[#69daff]">
                    {{ getEventGroupLabel(event) }}
                  </p>
                  <h3 class="text-sm font-black leading-tight">{{ event.summary }}</h3>
                  <p class="mt-1 text-[10px] font-bold uppercase tracking-wider" :style="{ color: activityTypeColor(event) }">
                    {{ activityTypeLabel(event) }}
                  </p>
                  <div class="mt-2 space-y-1 text-xs" :class="isDarkMode ? 'text-[#a3aac4]' : 'text-[#607089]'">
                    <p class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">schedule</span>
                      <span>{{ eventTime(event) }}</span>
                    </p>
                    <p class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">location_on</span>
                      <span>{{ event.location || 'Location TBA' }}</span>
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <p
            v-if="!todayEvents.length && !loadingEvents"
            class="rounded-2xl p-4 text-sm"
            :class="isDarkMode ? 'bg-[#141f38] text-[#a3aac4]' : 'bg-[#edf2f7] text-[#607089]'"
          >
            No events for this day.
          </p>
        </div>
      </section>

      <section v-else-if="currentView === 'weekly'" class="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        <article
          v-for="day in weekDays"
          :key="day.date.toISOString()"
          class="min-w-40 cursor-pointer rounded-3xl border p-3 transition"
          :class="
            isDarkMode
              ? 'border-[#192540] bg-[#141f38] shadow-[0_0_20px_rgba(105,218,255,0.07)] hover:border-[#69daff] hover:shadow-[0_0_24px_rgba(105,218,255,0.14)]'
              : 'border-[#dbe3ef] bg-white shadow-[0_0_12px_rgba(8,65,110,0.08)] hover:border-[#45cfff] hover:shadow-[0_0_16px_rgba(8,65,110,0.14)]'
          "
          @click="openDayFromWeek(day.date)"
        >
          <h3 class="mb-2 flex items-center gap-1 text-sm font-black">
            <span class="material-symbols-outlined text-sm text-[#00cffc]">calendar_month</span>
            {{ formatDayTitle(day.date) }}
            <span
              v-if="isCurrentDay(day.date)"
              class="material-symbols-outlined text-[14px] text-[#69daff]"
              style="font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20"
            >
              radio_button_checked
            </span>
          </h3>
          <ul class="space-y-2">
            <li
              v-for="event in day.events.slice(0, 3)"
              :key="event.uid"
              class="rounded-xl border-l-4 p-2 text-xs transition"
              :class="[isDarkMode ? 'bg-[#0f1930]' : 'bg-[#f1f5f9]', isEventDimmed(event) ? 'opacity-45 blur-[0.4px]' : '']"
              :style="{ borderLeftColor: activityTypeColor(event) }"
            >
              <p class="font-semibold" :class="isDarkMode ? 'text-[#dee5ff]' : 'text-[#334155]'">
                {{ formatTime(event.start) }} · {{ event.summary }}
              </p>
              <p class="mt-1 text-[10px] font-bold uppercase tracking-wide" :style="{ color: activityTypeColor(event) }">
                {{ activityTypeLabel(event) }}
              </p>
            </li>
          </ul>
          <p v-if="!day.events.length" class="text-xs text-[#7b8193] dark:text-[#a3aac4]">No events</p>
        </article>
      </section>

      <section
        v-else
        class="rounded-3xl border p-3 transition-colors"
        :class="
          isDarkMode
            ? 'border-[#192540] bg-[#141f38] shadow-[0_0_24px_rgba(105,218,255,0.08)]'
            : 'border-[#dbe3ef] bg-white shadow-[0_0_16px_rgba(8,65,110,0.08)]'
        "
      >
        <div class="mb-2 grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-wide" :class="isDarkMode ? 'text-[#a3aac4]' : 'text-[#607089]'">
          <span v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">{{ day }}</span>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="cell in monthCells"
            :key="cell.date.toISOString()"
            class="flex h-12 cursor-pointer flex-col items-center justify-center rounded-lg text-[11px] transition"
            :class="[
              cell.inMonth
                ? isDarkMode
                  ? 'bg-[#0f1930] text-[#dee5ff]'
                  : 'bg-[#f1f5f9] text-[#334155]'
                : isDarkMode
                  ? 'bg-[#0b1326] text-[#6b748f]'
                  : 'bg-[#f8fafc] text-[#94a3b8]',
              isSameDay(cell.date, currentDate) ? 'ring-2 ring-[#00cffc]' : '',
            ]"
            @click="openDayFromMonth(cell.date)"
          >
            <span>{{ cell.date.getDate() }}</span>
            <div v-if="cell.count" class="mt-0.5 flex items-center gap-0.5">
              <span
                v-for="(dotColor, index) in cell.dotColors"
                :key="`${cell.date.toISOString()}-${index}`"
                class="h-1.5 w-1.5 rounded-full"
                :style="{ backgroundColor: dotColor }"
              ></span>
              <span v-if="cell.extraCount" class="text-[9px] font-bold text-[#006880] dark:text-[#69daff]">+{{ cell.extraCount }}</span>
            </div>
          </div>
        </div>
      </section>

    </main>

    <footer
      class="fixed inset-x-0 bottom-0 z-30 border-t px-4 py-2 backdrop-blur transition-colors"
      :class="isDarkMode ? 'border-[#192540] bg-[#060e20]/95' : 'border-[#dbe3ef] bg-[#f7f8fb]/95'"
    >
      <div
        class="mx-auto grid max-w-md grid-cols-3 gap-2 rounded-2xl border p-2 transition-colors"
        :class="
          isDarkMode
            ? 'border-[#192540] bg-[#0f1930] shadow-[0_0_24px_rgba(105,218,255,0.08)]'
            : 'border-[#dbe3ef] bg-white shadow-[0_0_14px_rgba(8,65,110,0.08)]'
        "
      >
        <button
          type="button"
          class="flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-black uppercase tracking-wide transition"
          :class="
            currentView === 'daily'
              ? isDarkMode
                ? 'bg-[#69daff] text-[#004a5d] shadow-[0_0_14px_rgba(105,218,255,0.24)]'
                : 'bg-[#45cfff] text-[#004a5d] shadow-[0_0_10px_rgba(69,207,255,0.24)]'
              : isDarkMode
                ? 'text-[#a3aac4] hover:bg-[#141f38]'
                : 'text-[#56617a] hover:bg-[#edf2f7]'
          "
          @click="setView('daily')"
        >
          <span class="material-symbols-outlined text-[18px]">view_day</span>
          <span>Daily</span>
        </button>

        <button
          type="button"
          class="flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-black uppercase tracking-wide transition"
          :class="
            currentView === 'weekly'
              ? isDarkMode
                ? 'bg-[#69daff] text-[#004a5d] shadow-[0_0_14px_rgba(105,218,255,0.24)]'
                : 'bg-[#45cfff] text-[#004a5d] shadow-[0_0_10px_rgba(69,207,255,0.24)]'
              : isDarkMode
                ? 'text-[#a3aac4] hover:bg-[#141f38]'
                : 'text-[#56617a] hover:bg-[#edf2f7]'
          "
          @click="setView('weekly')"
        >
          <span class="material-symbols-outlined text-[18px]">calendar_view_week</span>
          <span>Weekly</span>
        </button>

        <button
          type="button"
          class="flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-black uppercase tracking-wide transition"
          :class="
            currentView === 'monthly'
              ? isDarkMode
                ? 'bg-[#69daff] text-[#004a5d] shadow-[0_0_14px_rgba(105,218,255,0.24)]'
                : 'bg-[#45cfff] text-[#004a5d] shadow-[0_0_10px_rgba(69,207,255,0.24)]'
              : isDarkMode
                ? 'text-[#a3aac4] hover:bg-[#141f38]'
                : 'text-[#56617a] hover:bg-[#edf2f7]'
          "
          @click="setView('monthly')"
        >
          <span class="material-symbols-outlined text-[18px]">calendar_month</span>
          <span>Monthly</span>
        </button>
      </div>
    </footer>
  </div>
</template>
