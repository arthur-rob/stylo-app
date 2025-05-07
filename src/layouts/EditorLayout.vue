<template>
    <div class="w-full flex">
        <div
            class="flex justify-between items-center h-full w-full max-h-screen"
        >
            <div
                class="canvas-aligner flex flex-col items-center justify-center h-full flex-shrink-0"
            >
                <canvas
                    id="stylo"
                    class="p-2 m-6 rounded bg-white self-center outline outline-white outline-4 flex-shrink-0"
                ></canvas>
                <div
                    class="gcode-preview h-full w-full p-2 bg-gray-800 border-t border-gray-400 overflow-y-scroll"
                >
                    <span v-if="!store.gCode || store.gCode.length == 0"
                        >generate gcode to preview</span
                    >
                    <ul>
                        <li
                            v-for="(command, index) in store.gCode"
                            :key="index"
                        >
                            {{ command }}
                        </li>
                    </ul>
                </div>
            </div>
            <div class="spacer w-px border-r border-gray-400 h-full"></div>
            <div
                class="controls-wrapper flex-initial justify-self-end h-screen w-full p-2 bg-gray-800"
            >
                <slot></slot>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useIndexStore } from '@/store/index'
const store = useIndexStore()
</script>
