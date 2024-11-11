<template>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useIndexStore } from '@/store/index'

const stylo = useIndexStore().stylo
stylo.clear()
const plotterList = ref<string[]>()
onMounted(async () => {
    stylo.init('#stylo', {renderSize: 2})
    stylo.render() 
})

</script>

<style scoped lang="scss">

</style>
