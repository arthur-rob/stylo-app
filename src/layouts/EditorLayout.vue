<template>
    <div
        class="relative flex flex-1 min-w-0 h-screen"
        @dragenter="onDragEnter"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
    >
        <main class="workspace relative flex flex-1 min-w-0 flex-col">
            <div class="flex flex-1 min-h-0 items-center justify-center p-8">
                <canvas
                    id="stylo"
                    class="max-w-full max-h-full bg-white rounded-sm shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
                ></canvas>
            </div>
            <div
                class="flex items-center gap-4 px-4 h-9 overflow-hidden whitespace-nowrap text-xs text-base-content/50 border-t border-base-300 bg-base-100/80"
            >
                <span>A4 · 210 × 297 mm</span>
                <span class="flex items-center gap-1.5">
                    <span class="legend-area"></span>
                    Drawable {{ area.width }} × {{ area.height }} mm
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="legend-cropped"></span>
                    Cropped (not plotted)
                </span>
            </div>
            <slot name="overlay"></slot>
        </main>
        <aside
            class="flex flex-col w-80 shrink-0 border-l border-base-300 bg-base-200"
        >
            <div class="flex-1 min-h-0 overflow-y-auto">
                <slot></slot>
                <GcodePanel />
            </div>
            <plotterActions :plot-label="plotLabel">
                <template v-if="$slots.plot" #plot>
                    <slot name="plot"></slot>
                </template>
            </plotterActions>
        </aside>
        <div
            v-if="isDraggingFiles"
            class="pointer-events-none absolute inset-3 z-40 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-base-100/85"
        >
            <div class="flex flex-col items-center gap-3 text-primary">
                <Icon name="upload" :size="36" />
                <p class="text-lg font-medium">{{ dropLabel }}</p>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import plotterActions from '@/components/plotterActions.vue'
import GcodePanel from '@/components/GcodePanel.vue'
import Icon from '@/components/Icon.vue'
import Controls from '@/lib/Controls'

const props = withDefaults(
    defineProps<{
        droppable?: boolean
        dropLabel?: string
        plotLabel?: string
    }>(),
    { droppable: false, dropLabel: 'Drop files', plotLabel: 'Plot' }
)
const emit = defineEmits<{ 'files-dropped': [files: File[]] }>()

const area = Controls.getDrawableArea()

// dragenter/dragleave fire for every child element: count them to avoid flicker
const isDraggingFiles = ref(false)
let dragDepth = 0
const hasFiles = (event: DragEvent) =>
    !!event.dataTransfer?.types.includes('Files')

const onDragEnter = (event: DragEvent) => {
    if (!props.droppable || !hasFiles(event)) return
    dragDepth++
    isDraggingFiles.value = true
}
const onDragOver = (event: DragEvent) => {
    if (!props.droppable || !hasFiles(event)) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
}
const onDragLeave = () => {
    if (!props.droppable) return
    dragDepth = Math.max(0, dragDepth - 1)
    if (dragDepth === 0) isDraggingFiles.value = false
}
const onDrop = (event: DragEvent) => {
    if (!props.droppable) return
    event.preventDefault()
    dragDepth = 0
    isDraggingFiles.value = false
    const files = Array.from(event.dataTransfer?.files || [])
    if (files.length) emit('files-dropped', files)
}
</script>
<style scoped>
.workspace {
    background-color: var(--color-base-100);
    background-image: radial-gradient(
        var(--color-base-300) 1px,
        transparent 1px
    );
    background-size: 16px 16px;
}
.legend-area {
    width: 14px;
    height: 0;
    border-top: 1px dashed #94a3b8;
}
.legend-cropped {
    width: 14px;
    height: 2px;
    border-radius: 1px;
    background: currentColor;
    opacity: 0.35;
}
</style>
