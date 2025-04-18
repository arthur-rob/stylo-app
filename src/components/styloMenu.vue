<template>
    <div
        class="stylo-menu h-screen border-r border-gray-500 bg-gray-800 flex flex-col"
    >
        <div
            class="stylo-logo flex p-2 w-full border-b border-gray-500 items-center"
        >
            <img
                src="/pentagon.svg"
                width="24px"
                alt="pentagone white border"
                class="mx-4 my-2"
            />
            <p class="font-semibold text-lg">Stylo</p>
        </div>
        <nav class="stylo-nav h-full p-2">
            <RouterLink
                to="/"
                class="block px-3 py-2 my-1 rounded-md hover:bg-gray-700"
            >
                Home
            </RouterLink>
            <RouterLink
                to="/carto"
                class="block px-3 py-2 my-1 rounded-md hover:bg-gray-700"
            >
                Carto
            </RouterLink>
        </nav>
        <div
            class="stylo-plotter py-4 px-2 flex items-center justify-center border-t border-gray-500"
        >
            <p>Plotter Status:</p>
            <div
                class="m-2 w-3 h-3 rounded-2xl"
                :class="[plotterStatusClass]"
            ></div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { useIndexStore } from '@/store/index'
const indexStore = useIndexStore()

const plotterStatusClass = computed<string>(() => {
    return indexStore.plotters.length > 0 ? 'bg-green-400' : 'bg-red-700'
})
</script>
<style lang="scss" scoped>
.stylo-menu {
    width: 180px;
    flex-shrink: 0;
}
</style>
