<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Select option',
  },
})

const emit = defineEmits(['update:modelValue'])
const open = ref(false)

const selectedLabel = computed(() => {
  if (!props.modelValue) {
    return props.placeholder
  }

  return props.modelValue
})

function selectOption(option) {
  emit('update:modelValue', option)
  open.value = false
}
</script>

<template>
  <div class="relative">
    <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
      {{ label }}
    </p>

    <button
      type="button"
      class="flex w-full items-center justify-between rounded-2xl border border-[#dbe3ef] bg-white px-4 py-3 text-left text-sm font-semibold text-[#1b243a] shadow-[0_0_10px_rgba(8,65,110,0.08)] transition hover:bg-[#f8fafc] dark:border-[#192540] dark:bg-[#141f38] dark:text-[#dee5ff] dark:shadow-[0_0_18px_rgba(105,218,255,0.08)] dark:hover:bg-[#192540]"
      @click="open = !open"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <span class="material-symbols-outlined ml-3 text-base text-[#006880] dark:text-[#69daff]">
        {{ open ? 'expand_less' : 'expand_more' }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute left-0 right-0 z-30 mt-2 max-h-56 overflow-y-auto rounded-2xl border border-[#dbe3ef] bg-white p-1 shadow-[0_0_18px_rgba(8,65,110,0.12)] no-scrollbar dark:border-[#192540] dark:bg-[#141f38] dark:shadow-[0_0_26px_rgba(105,218,255,0.12)]"
    >
      <button
        v-for="option in options"
        :key="option"
        type="button"
        class="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-[#334155] transition hover:bg-[#f1f5f9] dark:text-[#dee5ff] dark:hover:bg-[#0f1930]"
        :class="{
          'bg-[#dff6ff] text-[#003544] shadow-[0_0_10px_rgba(8,65,110,0.14)] dark:bg-[#0f1930] dark:text-[#69daff] dark:shadow-[0_0_14px_rgba(105,218,255,0.16)]': option === modelValue,
        }"
        @click="selectOption(option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>
