<template>
    <div class="flex h-screen overflow-hidden bg-base-100 text-base-content">
        <StyloMenu />
        <router-view></router-view>
        <Toasts />
    </div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useIndexStore } from '@/store/index'
import StyloMenu from '@/components/styloMenu.vue'
import Toasts from '@/components/Toasts.vue'

const indexStore = useIndexStore()
indexStore.syncPlotter().catch(() => {})

// Files dropped outside a drop zone must not make the browser leave the app
const preventFileNavigation = (event: DragEvent) => event.preventDefault()
onMounted(() => {
    window.addEventListener('dragover', preventFileNavigation)
    window.addEventListener('drop', preventFileNavigation)
})
onBeforeUnmount(() => {
    window.removeEventListener('dragover', preventFileNavigation)
    window.removeEventListener('drop', preventFileNavigation)
})
</script>
