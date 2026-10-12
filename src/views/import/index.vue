<template>
    <EditorLayout
        droppable
        drop-label="Drop SVG files to add them as layers"
        :plot-label="plotLabel"
        @files-dropped="addFiles"
    >
        <template #overlay>
            <div
                v-if="layers.length === 0"
                class="pointer-events-none absolute inset-x-0 top-0 bottom-9 flex items-center justify-center p-8"
            >
                <div
                    class="pointer-events-auto flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-base-300 bg-base-100/90 px-10 py-8 text-center shadow-xl"
                >
                    <Icon name="upload" :size="32" class="text-primary" />
                    <div>
                        <p class="font-medium">Drop SVG files here</p>
                        <p class="text-sm text-base-content/60">
                            Each file becomes a layer, plotted with its own pen
                        </p>
                    </div>
                    <button class="btn btn-primary btn-sm" @click="browse">
                        Browse files
                    </button>
                </div>
            </div>
        </template>

        <section class="p-4">
            <header class="flex items-center justify-between mb-3">
                <h2 class="flex items-center gap-2 text-sm font-semibold">
                    <Icon name="layers" />
                    Layers
                    <span
                        v-if="layers.length"
                        class="badge badge-sm badge-ghost font-normal"
                        >{{ layers.length }}</span
                    >
                </h2>
                <button class="btn btn-sm btn-soft" @click="browse">
                    <Icon name="plus" :size="14" />
                    Add SVG
                </button>
                <input
                    ref="fileInput"
                    type="file"
                    accept=".svg,image/svg+xml"
                    multiple
                    class="hidden"
                    @change="onFileInput"
                />
            </header>

            <p v-if="layers.length === 0" class="text-sm text-base-content/50">
                No layers yet. Drop SVG files anywhere or use
                <span class="font-medium">Add SVG</span>.
            </p>
            <template v-else>
                <p class="mb-2 text-xs text-base-content/50">
                    Plotted from top to bottom
                </p>
                <ul class="space-y-1" aria-label="Layers">
                    <li
                        v-for="layer in layers"
                        :key="layer.id"
                        class="group flex items-center gap-1 rounded-lg border px-1.5 py-1 cursor-pointer transition-colors"
                        :class="
                            layer.id === selectedId
                                ? 'border-primary/60 bg-base-300'
                                : 'border-transparent hover:bg-base-300/60'
                        "
                        @click="selectedId = layer.id"
                    >
                        <button
                            class="btn btn-ghost btn-xs btn-square"
                            :title="layer.visible ? 'Hide layer' : 'Show layer'"
                            :aria-label="`${layer.visible ? 'Hide' : 'Show'} ${layer.name}`"
                            :aria-pressed="layer.visible"
                            @click.stop="toggleVisibility(layer)"
                        >
                            <Icon
                                :name="layer.visible ? 'eye' : 'eyeOff'"
                                :size="14"
                            />
                        </button>
                        <label
                            class="relative size-4 shrink-0 rounded-full ring-1 ring-base-content/20 cursor-pointer"
                            :style="{ backgroundColor: layer.color }"
                            title="Pen color"
                            @click.stop
                        >
                            <input
                                type="color"
                                class="absolute inset-0 opacity-0 cursor-pointer"
                                :value="layer.color"
                                :aria-label="`Pen color of ${layer.name}`"
                                @input="setColor(layer, $event)"
                            />
                        </label>
                        <div
                            class="min-w-0 flex-1 pl-1.5"
                            :class="{ 'opacity-50': !layer.visible }"
                        >
                            <p class="truncate text-sm" :title="layer.name">
                                {{ layer.name }}
                            </p>
                            <p class="text-xs text-base-content/50">
                                {{ stats[layer.id]?.summary }}
                            </p>
                        </div>
                        <span
                            v-if="stats[layer.id]?.cropped"
                            class="text-warning"
                            :title="`${stats[layer.id].cropped} paths cropped`"
                        >
                            <Icon name="alert" :size="14" />
                        </span>
                        <button
                            class="btn btn-ghost btn-xs btn-square opacity-60 hover:opacity-100"
                            title="Plot only this layer"
                            :aria-label="`Plot only ${layer.name}`"
                            :disabled="!canPlot"
                            @click.stop="plotLayer(layer)"
                        >
                            <Icon name="play" :size="14" />
                        </button>
                        <button
                            class="btn btn-ghost btn-xs btn-square opacity-60 hover:opacity-100 hover:text-error"
                            title="Remove layer"
                            :aria-label="`Remove ${layer.name}`"
                            @click.stop="removeLayer(layer)"
                        >
                            <Icon name="trash" :size="14" />
                        </button>
                    </li>
                </ul>
            </template>
        </section>

        <section v-if="selected" class="p-4 border-t border-base-300">
            <h3 class="mb-3 text-sm font-semibold truncate">
                {{ selected.name }}
            </h3>
            <div class="grid grid-cols-2 gap-2">
                <label class="input input-sm col-span-2">
                    <span class="text-xs text-base-content/50">Scale</span>
                    <input
                        class="min-w-0 grow"
                        type="number"
                        min="1"
                        step="1"
                        :value="round(selected.scaleFactor * 100)"
                        @change="setScale(selected, $event)"
                    />
                    <span class="text-xs text-base-content/50">%</span>
                </label>
                <label class="input input-sm">
                    <span class="text-xs text-base-content/50">X</span>
                    <input
                        class="min-w-0 grow"
                        type="number"
                        step="1"
                        :value="round(selectedBounds?.x ?? 0)"
                        @change="setPosition(selected, 'x', $event)"
                    />
                    <span class="text-xs text-base-content/50">mm</span>
                </label>
                <label class="input input-sm">
                    <span class="text-xs text-base-content/50">Y</span>
                    <input
                        class="min-w-0 grow"
                        type="number"
                        step="1"
                        :value="round(selectedBounds?.y ?? 0)"
                        @change="setPosition(selected, 'y', $event)"
                    />
                    <span class="text-xs text-base-content/50">mm</span>
                </label>
            </div>
            <div class="mt-2 grid grid-cols-2 gap-2">
                <button
                    class="btn btn-sm btn-soft"
                    title="Scale and center the layer inside the drawable area"
                    @click="fitLayer(selected)"
                >
                    <Icon name="fit" :size="14" />
                    Fit to area
                </button>
                <button
                    class="btn btn-sm btn-soft"
                    title="Back to the original SVG size and position"
                    @click="resetLayer(selected)"
                >
                    <Icon name="reset" :size="14" />
                    Original size
                </button>
            </div>
            <div
                v-if="stats[selected.id]?.cropped"
                role="status"
                class="alert alert-warning alert-soft mt-3 py-2 text-xs"
            >
                <Icon name="alert" :size="14" />
                <span>
                    {{ stats[selected.id].cropped }} of
                    {{ stats[selected.id].paths }} paths go beyond the drawable
                    area and will be cropped.
                </span>
            </div>
        </section>
    </EditorLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import EditorLayout from '@/layouts/EditorLayout.vue'
import Icon from '@/components/Icon.vue'
import Path from '@/lib/geometry/Path'
import Stylo from '@/lib/Stylo'
import Layer from '@/lib/Layer'
import Vector from '@/lib/core/Vector'
import { svgToPaths } from '@/lib/SvgImport'
import { useIndexStore } from '@/store/index'
import { useToast } from '@/composables/useToast'
import { Rect } from '@/models/lib'

const PEN_COLORS = [
    '#111827',
    '#2563eb',
    '#dc2626',
    '#16a34a',
    '#d97706',
    '#7c3aed',
    '#db2777',
    '#0891b2',
]

interface LayerStats {
    bounds: Rect | null
    paths: number
    cropped: number
    summary: string
}

const store = useIndexStore()
const { notify } = useToast()
const stylo = new Stylo()
stylo.clearLayers()
const area = stylo.getDrawableArea()

// Layers live in the (non reactive) Stylo engine: refresh() publishes them to the view
const layers = shallowRef<Layer[]>([])
const stats = shallowRef<Record<string, LayerStats>>({})
const selectedId = ref<string | null>(null)
const fileInput = ref<HTMLInputElement>()

const selected = computed(
    () => layers.value.find((layer) => layer.id === selectedId.value) || null
)
const selectedBounds = computed(() =>
    selected.value ? stats.value[selected.value.id]?.bounds : null
)
const visibleCount = computed(
    () => layers.value.filter((layer) => layer.visible).length
)
const plotLabel = computed(() => {
    if (layers.value.length < 2) return 'Plot'
    return visibleCount.value === layers.value.length
        ? `Plot ${visibleCount.value} layers`
        : `Plot ${visibleCount.value} of ${layers.value.length} layers`
})
const canPlot = computed(() => !!store.activePlotter && !store.isDrawing)

const round = (value: number) => Math.round(value * 10) / 10

const computeStats = (layer: Layer): LayerStats => {
    const paths = layer.geometries.length
    const cropped = layer.countCroppedPaths(area)
    const bounds = layer.getBounds()
    const size = bounds
        ? `${Math.round(bounds.width)} × ${Math.round(bounds.height)} mm`
        : ''
    return {
        bounds,
        paths,
        cropped,
        summary: `${paths.toLocaleString()} paths · ${size}`,
    }
}

const refresh = () => {
    layers.value = [...stylo.layers]
    stats.value = Object.fromEntries(
        stylo.layers.map((layer) => [layer.id, computeStats(layer)])
    )
    stylo.render()
    store.gCode = layers.value.length ? stylo.generateGCode() : []
}

const nextColor = () =>
    PEN_COLORS.find(
        (color) => !stylo.layers.some((layer) => layer.color === color)
    ) || PEN_COLORS[stylo.layers.length % PEN_COLORS.length]

const isSvg = (file: File) =>
    file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')

const addFiles = async (files: File[]) => {
    const svgFiles = files.filter(isSvg)
    const ignored = files.length - svgFiles.length
    if (ignored > 0)
        notify(
            `${ignored} file${ignored > 1 ? 's' : ''} ignored: only SVG files are supported`,
            'warning'
        )

    let lastAdded: Layer | null = null
    for (const file of svgFiles) {
        try {
            const paths = svgToPaths(await file.text())
            if (paths.length === 0) {
                notify(`${file.name} contains no path to draw`, 'warning')
                continue
            }
            const layer = stylo.addLayer({
                name: file.name.replace(/\.svg$/i, ''),
                color: nextColor(),
            })
            paths.forEach((path) => layer.add(new Path(path)))
            lastAdded = layer
        } catch (error) {
            const reason = error instanceof Error ? error.message : error
            notify(`Could not import ${file.name}: ${reason}`, 'error')
        }
    }
    if (lastAdded) selectedId.value = lastAdded.id
    refresh()
}

const browse = () => fileInput.value?.click()
const onFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    addFiles(Array.from(input.files || []))
    input.value = ''
}

const inputNumber = (event: Event) =>
    parseFloat((event.target as HTMLInputElement).value)

const toggleVisibility = (layer: Layer) => {
    layer.visible = !layer.visible
    refresh()
}
const setColor = (layer: Layer, event: Event) => {
    layer.color = (event.target as HTMLInputElement).value
    refresh()
}
const setScale = (layer: Layer, event: Event) => {
    const percent = inputNumber(event)
    if (!Number.isFinite(percent) || percent <= 0) return refresh()
    // scale around the layer's top-left corner so it stays in place
    const before = layer.getBounds()
    layer.scaleFactor = percent / 100
    const after = layer.getBounds()
    if (before && after)
        layer.offset = layer.offset.add(
            new Vector(before.x - after.x, before.y - after.y)
        )
    refresh()
}
const setPosition = (layer: Layer, axis: 'x' | 'y', event: Event) => {
    const value = inputNumber(event)
    const bounds = layer.getBounds()
    if (!Number.isFinite(value) || !bounds) return refresh()
    layer.offset =
        axis === 'x'
            ? new Vector(layer.offset.x + value - bounds.x, layer.offset.y)
            : new Vector(layer.offset.x, layer.offset.y + value - bounds.y)
    refresh()
}
const fitLayer = (layer: Layer) => {
    layer.fitTo(area, 5)
    refresh()
}
const resetLayer = (layer: Layer) => {
    layer.scaleFactor = 1
    layer.offset = new Vector(0, 0)
    refresh()
}
const removeLayer = (layer: Layer) => {
    stylo.removeLayer(layer.id)
    if (selectedId.value === layer.id)
        selectedId.value = stylo.layers[0]?.id || null
    refresh()
}

const plotLayer = async (layer: Layer) => {
    try {
        await store.execute(stylo.generateGCode([layer]))
        notify(`${layer.name} sent to the plotter`, 'success')
    } catch {
        notify('Plot failed, check the plotter connection', 'error')
    }
}

onMounted(() => {
    stylo.init('#stylo', { renderSize: 4 })
    refresh()
})
onBeforeUnmount(() => {
    store.gCode = []
})
</script>
