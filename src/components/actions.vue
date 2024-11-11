<template>
    <div class="flex divide-y divide-gray-100 shadow-md p-2 fixed bottom-0 w-full items-center bg-white space-x-2 justify-end">
        <button @click="stylo.getGcode()" type="button" >Generate</button>
        <button @click="stylo.sendToPlotter()" class="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-6 font-medium text-neutral-50 shadow-lg shadow-neutral-500/20 transition active:scale-95">Draw</button>
    </div>
</template>
<script setup lang="ts">
import { useIndexStore } from '@/store/index'
const indexStore = useIndexStore()
const stylo = indexStore.stylo
</script>