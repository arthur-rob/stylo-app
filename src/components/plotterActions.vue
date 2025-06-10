<template>
    <div class="flex divide-y divide-gray-100 gap-2">
        <button
            class="btn btn-neutral"
            :disabled="store.isDrawing"
            @click="store.draw()"
        >
            Draw
        </button>
        <button class="btn btn-neutral" @click="store.resetPen()">
            Reset Pen
        </button>
        <button class="btn btn-neutral" @click="store.moveTo(10, 0)">
            X: +10
        </button>
        <button class="btn btn-neutral" @click="store.moveTo(-10, 0)">
            X: -10
        </button>
        <button class="btn btn-neutral" @click="store.moveTo(0, 10)">
            Y: +10
        </button>
        <button class="btn btn-neutral" @click="store.moveTo(0, -10)">
            Y: -10
        </button>
    </div>
</template>
<script setup lang="ts">
import { useIndexStore } from '@/store/index'
const store = useIndexStore()
</script>
