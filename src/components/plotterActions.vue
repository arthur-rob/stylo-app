<template>
    <div class="border-t border-base-300 bg-base-200">
        <section>
            <button
                class="flex w-full items-center gap-2 px-4 h-11 text-sm font-medium"
                :aria-expanded="showManual"
                @click="showManual = !showManual"
            >
                <Icon :name="showManual ? 'chevronDown' : 'chevronRight'" />
                Manual controls
            </button>
            <div v-if="showManual" class="flex items-center gap-4 px-4 pb-4">
                <div class="jog-pad grid grid-cols-3 gap-1">
                    <button
                        v-for="move in jogMoves"
                        :key="move.label"
                        class="btn btn-sm btn-square btn-soft"
                        :style="{ gridArea: move.area }"
                        :title="`${move.label} ${step} mm`"
                        :aria-label="`Move ${move.label} ${step} millimetres`"
                        :disabled="!canControl"
                        @click="jog(move.x, move.y)"
                    >
                        <Icon :name="move.icon" />
                    </button>
                    <span
                        class="flex items-center justify-center text-[10px] text-base-content/50"
                        style="grid-area: center"
                        >{{ step }}mm</span
                    >
                </div>
                <div class="flex flex-1 flex-col gap-2">
                    <div class="join w-full" role="group" aria-label="Step">
                        <button
                            v-for="value in steps"
                            :key="value"
                            class="join-item btn btn-xs flex-1"
                            :class="{
                                'btn-active btn-neutral': step === value,
                            }"
                            :aria-pressed="step === value"
                            @click="step = value"
                        >
                            {{ value }}
                        </button>
                    </div>
                    <button
                        class="btn btn-sm btn-soft"
                        title="Lower and lift the pen to unstick it"
                        :disabled="!canControl"
                        @click="run(store.resetPen, 'Pen reset failed')"
                    >
                        <Icon name="pen" :size="14" />
                        Reset pen
                    </button>
                </div>
            </div>
        </section>
        <div class="p-4 pt-3 border-t border-base-300">
            <button
                class="btn btn-primary w-full"
                :disabled="!canPlot"
                @click="plot"
            >
                <span
                    v-if="store.isDrawing"
                    class="loading loading-spinner loading-sm"
                ></span>
                <Icon v-else name="play" />
                {{ store.isDrawing ? 'Plotting…' : plotLabel }}
            </button>
            <p
                v-if="plotHint"
                class="mt-2 text-xs text-center text-base-content/50"
            >
                {{ plotHint }}
            </p>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import { useIndexStore } from '@/store/index'
import { useToast } from '@/composables/useToast'

withDefaults(defineProps<{ plotLabel?: string }>(), { plotLabel: 'Plot' })

const store = useIndexStore()
const { notify } = useToast()

const showManual = ref(false)
const steps = [1, 10, 50]
const step = ref(10)
// directions follow the preview: Y grows downward
const jogMoves = [
    { label: 'Y −', icon: 'chevronUp', area: 'up', x: 0, y: -1 },
    { label: 'X −', icon: 'chevronLeft', area: 'left', x: -1, y: 0 },
    { label: 'X +', icon: 'chevronRight', area: 'right', x: 1, y: 0 },
    { label: 'Y +', icon: 'chevronDown', area: 'down', x: 0, y: 1 },
] as const

const hasPlotter = computed(() => !!store.activePlotter)
const canControl = computed(() => hasPlotter.value && !store.isDrawing)
const canPlot = computed(() => canControl.value && store.gCode.length > 0)
const plotHint = computed(() => {
    if (store.isDrawing) return 'Sending instructions to the plotter'
    if (!hasPlotter.value) return 'Connect a plotter to start plotting'
    if (store.gCode.length === 0) return 'Nothing to plot yet'
    return ''
})

const run = async (action: () => Promise<void>, errorMessage: string) => {
    try {
        await action()
    } catch {
        notify(errorMessage, 'error')
    }
}
const jog = (x: number, y: number) =>
    run(() => store.moveTo(x * step.value, y * step.value), 'Move failed')
const plot = async () => {
    try {
        await store.draw()
        notify('Plot sent to the plotter', 'success')
    } catch {
        notify('Plot failed, check the plotter connection', 'error')
    }
}
</script>
<style scoped>
.jog-pad {
    grid-template-areas:
        '. up .'
        'left center right'
        '. down .';
}
</style>
