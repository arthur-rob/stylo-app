<template>
    <div>
        <div
            v-if="layers.length > 1"
            class="join mb-3 w-full"
            role="group"
            aria-label="Plot mode"
        >
            <button
                v-for="option in modes"
                :key="option.value"
                class="join-item btn btn-xs flex-1"
                :class="{ 'btn-active btn-neutral': mode === option.value }"
                :aria-pressed="mode === option.value"
                :title="option.title"
                @click="mode = option.value"
            >
                {{ option.label }}
            </button>
        </div>

        <template v-if="oneByOne">
            <template v-if="next">
                <p class="mb-1 text-xs text-base-content/50">
                    Layer {{ doneCount + 1 }} of {{ layers.length }}
                </p>
                <div class="mb-2 flex items-center gap-2">
                    <span
                        class="size-3 shrink-0 rounded-full ring-1 ring-base-content/20"
                        :style="{ backgroundColor: next.color }"
                    ></span>
                    <span class="truncate text-sm font-medium">{{
                        next.name
                    }}</span>
                </div>
                <div class="flex gap-2">
                    <button
                        class="btn btn-primary flex-1"
                        :disabled="!canPlot"
                        @click="emit('plotLayer', next)"
                    >
                        <span
                            v-if="plotting"
                            class="loading loading-spinner loading-sm"
                        ></span>
                        <Icon v-else name="play" />
                        {{ plotting ? 'Sending…' : 'Plot this layer' }}
                    </button>
                    <button
                        class="btn btn-ghost"
                        title="Mark this layer as done without plotting it"
                        :disabled="plotting"
                        @click="emit('skip', next)"
                    >
                        Skip
                    </button>
                </div>
            </template>
            <template v-else>
                <div
                    role="status"
                    class="alert alert-success alert-soft py-2 text-sm"
                >
                    <Icon name="check" />
                    All {{ layers.length }} layers done
                </div>
                <button
                    class="btn btn-soft mt-2 w-full"
                    @click="emit('restart')"
                >
                    <Icon name="reset" :size="14" />
                    Start over
                </button>
            </template>
        </template>

        <button
            v-else
            class="btn btn-primary w-full"
            :disabled="!canPlot || !hasGCode"
            @click="emit('plotAll')"
        >
            <span
                v-if="plotting"
                class="loading loading-spinner loading-sm"
            ></span>
            <Icon v-else name="play" />
            {{ plotting ? 'Plotting…' : allLabel }}
        </button>

        <p v-if="hint" class="mt-2 text-center text-xs text-base-content/50">
            {{ hint }}
            <RouterLink
                v-if="!hasPlotter"
                to="/plotters"
                class="link link-primary"
                >Manage plotters</RouterLink
            >
        </p>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/Icon.vue'
import Layer from '@/lib/Layer'

export type PlotMode = 'all' | 'layers'

const props = defineProps<{
    // visible layers, in plot order
    layers: Layer[]
    next: Layer | null
    doneCount: number
    hasPlotter: boolean
    plotting: boolean
    hasGCode: boolean
}>()
const mode = defineModel<PlotMode>('mode', { required: true })
const emit = defineEmits<{
    plotAll: []
    plotLayer: [layer: Layer]
    skip: [layer: Layer]
    restart: []
}>()

const modes = [
    {
        value: 'layers',
        label: 'One by one',
        title: 'Plot each layer on its own, to change pens in between',
    },
    {
        value: 'all',
        label: 'All at once',
        title: 'Plot every visible layer in a single run, with the same pen',
    },
] as const

const oneByOne = computed(
    () => mode.value === 'layers' && props.layers.length > 1
)
const canPlot = computed(() => props.hasPlotter && !props.plotting)
const allLabel = computed(() =>
    props.layers.length > 1 ? `Plot ${props.layers.length} layers` : 'Plot'
)
const hint = computed(() => {
    if (!props.hasPlotter) return 'No plotter selected.'
    if (props.plotting) return 'Sending instructions to the plotter'
    if (props.layers.length === 0) return 'Nothing to plot yet'
    if (!oneByOne.value || !props.next) return ''
    return props.doneCount === 0
        ? 'Load the pen for this layer, then plot it.'
        : 'Wait until the plotter has finished, change the pen, then plot.'
})
</script>
