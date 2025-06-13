<script setup>
import { computed, inject, ref, watch } from 'vue'

const props = defineProps({
  value: {
    required: true,
  },
})

const selection = inject('toggleGroupSelection')

const isSelected = computed(() => selection.value.includes(props.value))

function onToggle(e) {
    if(isSelected.value) {
        selection.value = selection.value.filter((item) => item !== props.value)
    } else {
        selection.value = [...selection.value, props.value]
    }
}

const style = computed(() => ({
    display:'flex', 
    'align-items': 'center',
    'justify-content': 'center', 
    border: isSelected.value? '1px solid white': '1px solid var(--color-background-mute)', 
    width: '2rem', height:'2rem' 
}))
</script>

<template>
    <div @click="onToggle" :class="{'ui-selected': isSelected}">
        <slot :selected="isSelected"></slot>
    </div>
</template>
