<script setup>
import { computed, provide } from 'vue'

const props = defineProps({
  modelValue: {
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const modelValue = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emit('update:modelValue', value)
  }
})

provide('toggleGroupSelection', modelValue)
</script>

<template>
    <div>
        <slot></slot>
    </div>
</template>
