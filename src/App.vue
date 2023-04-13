<template>
    <div class="stylo-layout">
        <canvas id="stylo"></canvas>
        <div class="control-panel">
            
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import StyloJS from '@/lib/Stylo.ts'
import Circle from '@/lib/geometry/Circle.ts'
const Stylo = new StyloJS()
let c1 = new Circle(150, 109, 100)
Stylo.add(c1)

onMounted(() => {
    Stylo.init('#stylo', {renderSize: 2})
    Stylo.render()    
})


</script>
<style scoped>
</style>
