<template>
    <div class="flex bg-gray-800 app-index">
        <StyloMenu />
        <router-view></router-view>
    </div>
</template>
<script lang="ts" setup>
import '@/index.css'
import { useIndexStore } from '@/store/index'
import StyloMenu from '@/components/styloMenu.vue'

const indexStore = useIndexStore()
indexStore.syncPlotter()
</script>
<style lang="scss" scoped>
.app-index {
    background-image: repeating-linear-gradient(
        315deg,
        var(--color-gray-700) 0,
        var(--color-gray-700) 1px,
        transparent 0,
        transparent 50%
    );
    background-attachment: fixed;
    background-size: 10px 10px;
}
</style>
