<template>
    <nav class="divide-y divide-gray-100 shadow-md p-2">
        <ul class="flex flex space-x-2">
            <!-- Desktop Navigation Links -->
            <li>
                <RouterLink to="/" class="block px-4 py-2 rounded-md">Home</RouterLink>
                <RouterLink to="/carto" class="block px-4 py-2 rounded-md">Carto</RouterLink>
            </li>
        </ul>
    </nav>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useIndexStore } from '@/store/index'

const menuItems = ref([
    { text: 'Home', link: '/' }
])
const indexStore = useIndexStore()
</script>