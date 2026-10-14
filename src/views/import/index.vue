<template>
    <EditorLayout
        droppable
        drop-label="Drop SVG files to add them as layers"
        @files-dropped="addFiles"
    >
        <template #plot>
            <PlotPanel
                v-model:mode="plotMode"
                :layers="visibleLayers"
                :next="nextLayer"
                :done-count="doneCount"
                :has-plotter="!!store.activePlotter"
                :plotting="store.isDrawing"
                :has-g-code="store.gCode.length > 0"
                @plot-all="plotAll"
                @plot-layer="plotLayer"
                @skip="(layer) => markLayer(layer, 'skipped')"
                @restart="progress = {}"
            />
        </template>
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
                            Each SVG group becomes a layer, plotted with its own
                            pen
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
                <div v-for="group in layerGroups" :key="group.key" class="mb-2">
                    <div
                        v-if="group.layers.length > 1"
                        class="flex items-center gap-1 px-1.5 py-1 text-xs text-base-content/60"
                    >
                        <button
                            class="btn btn-ghost btn-xs btn-square"
                            :title="
                                group.allHidden
                                    ? 'Show all layers'
                                    : 'Hide all layers'
                            "
                            :aria-label="`${group.allHidden ? 'Show' : 'Hide'} all layers of ${group.name}`"
                            @click="toggleGroupVisibility(group.layers)"
                        >
                            <Icon
                                :name="group.allHidden ? 'eyeOff' : 'eye'"
                                :size="14"
                            />
                        </button>
                        <span
                            class="min-w-0 flex-1 truncate font-medium"
                            :title="group.name"
                            >{{ group.name }}</span
                        >
                        <span>{{ group.layers.length }} layers</span>
                        <button
                            class="btn btn-ghost btn-xs btn-square opacity-60 hover:opacity-100 hover:text-error"
                            title="Remove the file and all its layers"
                            :aria-label="`Remove ${group.name}`"
                            @click="removeLayers(group.layers)"
                        >
                            <Icon name="trash" :size="14" />
                        </button>
                    </div>
                    <ul
                        class="space-y-1"
                        :class="{
                            'ml-3 border-l border-base-300 pl-1':
                                group.layers.length > 1,
                        }"
                        :aria-label="`Layers of ${group.name}`"
                    >
                        <li
                            v-for="layer in group.layers"
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
                                :title="
                                    layer.visible ? 'Hide layer' : 'Show layer'
                                "
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
                                <p
                                    class="truncate text-xs text-base-content/50"
                                >
                                    {{ stats[layer.id]?.summary }}
                                </p>
                            </div>
                            <span
                                v-if="oneByOne && nextLayer?.id === layer.id"
                                class="text-[10px] font-semibold uppercase tracking-wide text-primary"
                                >Next</span
                            >
                            <span
                                v-else-if="progress[layer.id] === 'plotted'"
                                class="text-success"
                                title="Plotted in this session"
                            >
                                <Icon name="check" :size="14" />
                            </span>
                            <span
                                v-else-if="progress[layer.id] === 'skipped'"
                                class="text-[10px] text-base-content/40"
                                >skipped</span
                            >
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
                </div>
            </template>
        </section>

        <section v-if="selected" class="p-4 border-t border-base-300">
            <h3 class="text-sm font-semibold truncate">
                {{ selected.name }}
            </h3>
            <p
                v-if="selectedLinked.length > 1"
                class="mt-0.5 text-xs text-base-content/50"
            >
                Size and position apply to the
                {{ selectedLinked.length }} layers of this file to keep them
                aligned.
            </p>
            <div class="mb-3"></div>
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
                    title="Scale and center the drawing inside the drawable area"
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
            <p class="mt-2 text-xs text-base-content/50">
                Drag the drawing on the page to move it, hold Shift to keep it
                aligned. Arrow keys nudge by 1 mm, 10 mm with Shift.
            </p>
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
import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    watch,
} from 'vue'
import EditorLayout from '@/layouts/EditorLayout.vue'
import Icon from '@/components/Icon.vue'
import PlotPanel, { PlotMode } from '@/components/PlotPanel.vue'
import Path from '@/lib/geometry/Path'
import Stylo from '@/lib/Stylo'
import Layer, { fitLayersTo, unionBounds } from '@/lib/Layer'
import Vector from '@/lib/core/Vector'
import { svgToLayers } from '@/lib/SvgImport'
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
// file name of each import, layers of one file share its source id
const sources = new Map<string, string>()

// Layers of the same file are transformed together to stay aligned
const linkedLayers = (layer: Layer, list = stylo.layers) =>
    layer.source
        ? list.filter((other) => other.source === layer.source)
        : [layer]
const sharedBounds = (group: Layer[]) =>
    unionBounds(group.map((layer) => layer.getBounds()))

const selected = computed(
    () => layers.value.find((layer) => layer.id === selectedId.value) || null
)
const selectedLinked = computed(() =>
    selected.value ? linkedLayers(selected.value, layers.value) : []
)
const selectedBounds = computed(() =>
    unionBounds(
        selectedLinked.value.map((layer) => stats.value[layer.id]?.bounds)
    )
)
// consecutive layers coming from the same file are listed together
const layerGroups = computed(() => {
    const groups: {
        key: string
        name: string
        layers: Layer[]
        allHidden: boolean
    }[] = []
    for (const layer of layers.value) {
        const key = layer.source || layer.id
        const last = groups[groups.length - 1]
        if (last?.key === key) last.layers.push(layer)
        else
            groups.push({
                key,
                name: (layer.source && sources.get(layer.source)) || layer.name,
                layers: [layer],
                allHidden: false,
            })
    }
    groups.forEach((group) => {
        group.allHidden = group.layers.every((layer) => !layer.visible)
    })
    return groups
})
const visibleCount = computed(
    () => layers.value.filter((layer) => layer.visible).length
)
const canPlot = computed(() => !!store.activePlotter && !store.isDrawing)

// --- Plotting one layer at a time, to change pens in between ---
const PLOT_MODE_KEY = 'stylo.plotMode'
const readPlotMode = (): PlotMode => {
    try {
        return localStorage.getItem(PLOT_MODE_KEY) === 'all' ? 'all' : 'layers'
    } catch {
        return 'layers'
    }
}
const plotMode = ref<PlotMode>(readPlotMode())
watch(plotMode, (mode) => {
    try {
        localStorage.setItem(PLOT_MODE_KEY, mode)
    } catch {
        // the choice only lasts for this visit
    }
})

// layers sent (or skipped) since the session started, by id
const progress = shallowRef<Record<string, 'plotted' | 'skipped'>>({})
const visibleLayers = computed(() =>
    layers.value.filter((layer) => layer.visible)
)
const oneByOne = computed(
    () => plotMode.value === 'layers' && visibleLayers.value.length > 1
)
const nextLayer = computed(
    () => visibleLayers.value.find((layer) => !progress.value[layer.id]) || null
)
const doneCount = computed(
    () => visibleLayers.value.filter((layer) => progress.value[layer.id]).length
)
const markLayer = (layer: Layer, status: 'plotted' | 'skipped') => {
    progress.value = { ...progress.value, [layer.id]: status }
}

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
    renderCanvas()
    // no visible layer: nothing to plot, not even the setup commands
    store.gCode = visibleCount.value ? stylo.generateGCode() : []
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

    let firstAdded: Layer | null = null
    for (const file of svgFiles) {
        const fileName = file.name.replace(/\.svg$/i, '')
        try {
            const { layers: parsed, duplicates } = svgToLayers(
                await file.text()
            )
            if (parsed.length === 0) {
                notify(`${file.name} contains no path to draw`, 'warning')
                continue
            }
            if (duplicates.length)
                notify(
                    `Skipped ${duplicates.map((name) => `"${name}"`).join(', ')} in ${file.name}: identical to another group`,
                    'info',
                    6000
                )
            const source = Math.random().toString(16).slice(2, 10)
            sources.set(source, fileName)
            parsed.forEach((svgLayer, index) => {
                const layer = stylo.addLayer({
                    name: parsed.length > 1 ? svgLayer.name : fileName,
                    color: svgLayer.color || nextColor(),
                    source,
                })
                svgLayer.paths.forEach((path) => layer.add(new Path(path)))
                if (index === 0) firstAdded = layer
            })
        } catch (error) {
            const reason = error instanceof Error ? error.message : error
            notify(`Could not import ${file.name}: ${reason}`, 'error')
        }
    }
    if (firstAdded) selectedId.value = (firstAdded as Layer).id
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
const toggleGroupVisibility = (group: Layer[]) => {
    const visible = group.every((layer) => !layer.visible)
    group.forEach((layer) => (layer.visible = visible))
    refresh()
}
const moveBy = (group: Layer[], delta: Vector) =>
    group.forEach((layer) => (layer.offset = layer.offset.add(delta)))

const setScale = (layer: Layer, event: Event) => {
    const percent = inputNumber(event)
    if (!Number.isFinite(percent) || percent <= 0) return refresh()
    // scale around the drawing's top-left corner so it stays in place
    const group = linkedLayers(layer)
    const before = sharedBounds(group)
    group.forEach((linked) => (linked.scaleFactor = percent / 100))
    const after = sharedBounds(group)
    if (before && after)
        moveBy(group, new Vector(before.x - after.x, before.y - after.y))
    refresh()
}
const setPosition = (layer: Layer, axis: 'x' | 'y', event: Event) => {
    const value = inputNumber(event)
    const group = linkedLayers(layer)
    const bounds = sharedBounds(group)
    if (!Number.isFinite(value) || !bounds) return refresh()
    moveBy(
        group,
        axis === 'x'
            ? new Vector(value - bounds.x, 0)
            : new Vector(0, value - bounds.y)
    )
    refresh()
}
const fitLayer = (layer: Layer) => {
    fitLayersTo(linkedLayers(layer), area, 5)
    refresh()
}
const resetLayer = (layer: Layer) => {
    linkedLayers(layer).forEach((linked) => {
        linked.scaleFactor = 1
        linked.offset = new Vector(0, 0)
    })
    refresh()
}
const removeLayers = (group: Layer[]) => {
    group.forEach((layer) => stylo.removeLayer(layer.id))
    if (!stylo.getLayer(selectedId.value || ''))
        selectedId.value = stylo.layers[0]?.id || null
    refresh()
}
const removeLayer = (layer: Layer) => removeLayers([layer])

const plotLayer = async (layer: Layer) => {
    try {
        await store.execute(stylo.generateGCode([layer]))
        markLayer(layer, 'plotted')
        const next = oneByOne.value ? nextLayer.value : null
        notify(
            next
                ? `${layer.name} sent. Once it's finished, load the pen for ${next.name}.`
                : `${layer.name} sent to the plotter`,
            'success',
            next ? 8000 : 4000
        )
    } catch {
        notify('Plot failed, check the plotter connection', 'error')
    }
}
const plotAll = async () => {
    try {
        await store.draw()
        notify('Plot sent to the plotter', 'success')
    } catch {
        notify('Plot failed, check the plotter connection', 'error')
    }
}

// --- Canvas: drag a drawing to move it, arrow keys to nudge it ---

const SELECTION_COLOR = '#6366f1'

// Preview plus a dashed box around the selected drawing
const renderCanvas = () => {
    stylo.render()
    const context = stylo.getContext()
    if (!context || !selected.value) return
    const bounds = sharedBounds(
        linkedLayers(selected.value).filter((layer) => layer.visible)
    )
    if (!bounds) return
    context.save()
    context.strokeStyle = SELECTION_COLOR
    context.lineWidth = 1.5 / stylo.renderSize
    context.setLineDash([3, 2])
    context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
    context.restore()
}

// Redraw at most once per frame, and only rebuild stats and G-code once the
// drawing stops moving: both are too slow to run on every pointer move
let frame = 0
let settleTimer: ReturnType<typeof setTimeout> | undefined
const scheduleRender = () => {
    if (frame) return
    frame = requestAnimationFrame(() => {
        frame = 0
        renderCanvas()
    })
}
const settle = (delay = 0) => {
    clearTimeout(settleTimer)
    settleTimer = setTimeout(refresh, delay)
}

const canvasPoint = (event: MouseEvent) => {
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect()
    return new Vector(
        ((event.clientX - rect.left) / rect.width) * stylo.width,
        ((event.clientY - rect.top) / rect.height) * stylo.height
    )
}

// Visible drawing under the point, the selected one first since drawings overlap
const drawingAt = (point: Vector): Layer | null => {
    const contains = (layer: Layer) => {
        const bounds = unionBounds(
            linkedLayers(layer)
                .filter((linked) => linked.visible)
                .map((linked) => stats.value[linked.id]?.bounds ?? null)
        )
        return (
            !!bounds &&
            point.x >= bounds.x &&
            point.x <= bounds.x + bounds.width &&
            point.y >= bounds.y &&
            point.y <= bounds.y + bounds.height
        )
    }
    if (selected.value?.visible && contains(selected.value))
        return selected.value
    return (
        [...stylo.layers]
            .reverse()
            .find((layer) => layer.visible && contains(layer)) || null
    )
}

let drag: {
    start: Vector
    group: Layer[]
    offsets: Vector[]
    moved: boolean
} | null = null

const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return
    const canvas = event.target as HTMLCanvasElement
    canvas.focus()
    const point = canvasPoint(event)
    const layer = drawingAt(point)
    if (!layer) return
    const group = linkedLayers(layer)
    // picking another drawing selects its first layer, like after an import
    if (!selected.value || !group.includes(selected.value))
        selectedId.value = group[0].id
    drag = {
        start: point,
        group,
        offsets: group.map((linked) => linked.offset),
        moved: false,
    }
    canvas.setPointerCapture(event.pointerId)
    canvas.style.cursor = 'grabbing'
    event.preventDefault()
}

const onPointerMove = (event: PointerEvent) => {
    const canvas = event.target as HTMLCanvasElement
    const point = canvasPoint(event)
    if (!drag) {
        canvas.style.cursor = drawingAt(point) ? 'move' : ''
        return
    }
    let dx = point.x - drag.start.x
    let dy = point.y - drag.start.y
    if (event.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0
        else dx = 0
    }
    const { offsets } = drag
    drag.group.forEach((layer, index) => {
        layer.offset = new Vector(offsets[index].x + dx, offsets[index].y + dy)
    })
    drag.moved = true
    scheduleRender()
}

const onPointerUp = (event: PointerEvent) => {
    if (!drag) return
    const { moved } = drag
    drag = null
    const canvas = event.target as HTMLCanvasElement
    if (canvas.hasPointerCapture(event.pointerId))
        canvas.releasePointerCapture(event.pointerId)
    canvas.style.cursor = 'move'
    if (moved) settle()
}

const ARROWS: Record<string, [number, number]> = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
}
const onKeyDown = (event: KeyboardEvent) => {
    const arrow = ARROWS[event.key]
    if (!arrow || !selected.value) return
    event.preventDefault()
    const step = event.shiftKey ? 10 : 1
    moveBy(
        linkedLayers(selected.value),
        new Vector(arrow[0] * step, arrow[1] * step)
    )
    scheduleRender()
    settle(250)
}

watch(selectedId, () => renderCanvas())

const bindCanvas = (canvas: HTMLCanvasElement) => {
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('keydown', onKeyDown)
}
const unbindCanvas = (canvas: HTMLCanvasElement) => {
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
    canvas.removeEventListener('keydown', onKeyDown)
}

onMounted(() => {
    const canvas = stylo.init('#stylo', { renderSize: 4 })
    canvas.tabIndex = 0
    canvas.style.touchAction = 'none'
    canvas.setAttribute(
        'aria-label',
        'Drawing preview: drag or use the arrow keys to move the selected drawing'
    )
    bindCanvas(canvas)
    refresh()
})
onBeforeUnmount(() => {
    const canvas = stylo.canvas
    if (canvas) {
        unbindCanvas(canvas)
        canvas.removeAttribute('tabindex')
        canvas.removeAttribute('aria-label')
        canvas.style.cursor = ''
    }
    cancelAnimationFrame(frame)
    clearTimeout(settleTimer)
    store.gCode = []
})
</script>
