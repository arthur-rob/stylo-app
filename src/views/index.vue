<template>
    <EditorLayout></EditorLayout>
</template>
<script setup lang="ts">
import EditorLayout from '@/layouts/EditorLayout.vue'

import { onMounted } from 'vue'
import Stylo from '@/lib/Stylo'
import Circle from '@/lib/geometry/Circle'

const stylo = new Stylo()
const c1 = new Circle(50, 40, 10)
const c2 = new Circle(20, 20, 10)
stylo.add(c1)
stylo.add(c2)

onMounted(async () => {
    stylo.init('#stylo', { renderSize: 2 })
    stylo.render()
})
</script>
