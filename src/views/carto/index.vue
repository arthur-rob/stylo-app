<template>
    <EditorLayout> </EditorLayout>
</template>
<script setup lang="ts">
import EditorLayout from '@/layouts/EditorLayout.vue'
import { onMounted } from 'vue'
import Stylo from '@/lib/Stylo'

const stylo = new Stylo()

onMounted(async () => {
    stylo.init('#stylo', { renderSize: 2 })
    stylo.render()
})
</script>
