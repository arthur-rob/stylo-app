<script setup lang="ts">
import { onMounted } from 'vue'
import { useIndexStore } from '@/store/index'

const stylo = useIndexStore().stylo

onMounted(async () => {
    stylo.init('#stylo', { renderSize: 2 })
    stylo.render()
})
</script>
