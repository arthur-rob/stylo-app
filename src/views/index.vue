<template>
    <Layout>
        <div class="sketch-properties">
            <div class="m-2 plotter-list">
                <h3 class="text-lg">Plotters list:</h3>
                <ul class="bg-stone-100 rounded p-2 ">
                    <li v-for="plotter in plotterList"> {{  plotter }}</li>
                </ul>
            </div>
        </div>
    </Layout>
</template>

<script setup lang="ts">
import Layout from "@/views/editor/layout.vue";
import { onMounted, ref } from 'vue'
import Stylo from '@/lib/Stylo'
import Circle from '@/lib/geometry/Circle'

const stylo = new Stylo()
const plotterList = ref<string[]>()
let c1 = new Circle(50, 40, 10)
stylo.add(c1)

onMounted(async () => {
    stylo.init('#stylo', {renderSize: 2})
    stylo.render()    
    plotterList.value = await stylo.listPlotter()
})

const generate = () => {
    console.log(stylo.getGcode())
}

</script>

<style scoped lang="scss">

</style>
