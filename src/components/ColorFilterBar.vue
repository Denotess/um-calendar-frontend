<script setup>
const props = defineProps({
  label: {
    type: String,
    default: 'Activity Type',
  },
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

function selectOption(key) {
  emit('update:modelValue', key)
}
</script>

<template>
  <div>
    <p class="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#7b8193] dark:text-[#a3aac4]">
      {{ label }}
    </p>

    <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        v-for="option in options"
        :key="option.key"
        type="button"
        class="inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-wide transition"
        :class="
          modelValue === option.key
            ? 'border-transparent bg-[#45cfff] text-[#004a5d] shadow-[0_0_10px_rgba(69,207,255,0.24)] dark:bg-[#69daff] dark:shadow-[0_0_14px_rgba(105,218,255,0.25)]'
            : 'border-[#dbe3ef] bg-[#edf2f7] text-[#56617a] hover:bg-[#e2e9f3] dark:border-[#192540] dark:bg-[#141f38] dark:text-[#a3aac4] dark:hover:bg-[#192540]'
        "
        @click="selectOption(option.key)"
      >
        <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: option.color }"></span>
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>
