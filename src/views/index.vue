<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useIndexStore } from '@/store/index'
import Circle from '@/lib/geometry/Circle'

const stylo = useIndexStore().stylo
const plotterList = ref<string[]>()
const c1 = new Circle(50, 40, 10)
const c2 = new Circle(20, 20, 10)
stylo.add(c1)
stylo.add(c2)

onMounted(async () => {
    stylo.init('#stylo', { renderSize: 2 })
    stylo.render()
    plotterList.value = await stylo.listPlotter()
})
</script>
