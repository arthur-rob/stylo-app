<template>
    <EditorLayout> Hello </EditorLayout>
</template>
<script setup lang="ts">
import EditorLayout from '@/layouts/EditorLayout.vue'
import { onMounted } from 'vue'
import { useIndexStore } from '@/store/index'

const stylo = useIndexStore().stylo

onMounted(async () => {
    stylo.init('#stylo', { renderSize: 2 })
    stylo.render()
})
</script>
