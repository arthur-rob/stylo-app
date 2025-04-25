<template>
    <EditorLayout></EditorLayout>
</template>
<script setup lang="ts">
import EditorLayout from '@/layouts/EditorLayout.vue'

import { onMounted } from 'vue'
import Stylo from '@/lib/Stylo'
import Circle from '@/lib/geometry/Circle'
import Path from '@/lib/geometry/Path'
import Vector from '@/lib/core/Vector'
import Square from '@/lib/geometry/Square'

const stylo = new Stylo()
const c1 = new Circle(50, 40, 2)
const c2 = new Circle(20, 20, 10)
const s1 = new Square(120, 20, 50)
const p1 = new Path([
    new Vector(100, 80),
    new Vector(120, 120),
    new Vector(90, 110),
    new Vector(104, 105),
])

stylo.add(c1)
stylo.add(c2)
stylo.add(p1)
stylo.add(s1)

onMounted(async () => {
    stylo.init('#stylo', { renderSize: 2 })
    stylo.render()
})
</script>
