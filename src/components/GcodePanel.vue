<template>
    <section class="border-t border-base-300">
        <div class="flex items-center gap-1 px-4 h-11">
            <button
                class="flex flex-1 items-center gap-2 text-sm font-medium text-left"
                :aria-expanded="isOpen"
                @click="isOpen = !isOpen"
            >
                <Icon :name="isOpen ? 'chevronDown' : 'chevronRight'" />
                G-code
                <span class="badge badge-sm badge-ghost font-normal">
                    {{ lineCount }} lines
                </span>
            </button>
            <button
                class="btn btn-ghost btn-xs btn-square"
                title="Copy G-code"
                aria-label="Copy G-code"
                :disabled="!hasContent"
                @click="copy"
            >
                <Icon name="copy" :size="14" />
            </button>
            <button
                class="btn btn-ghost btn-xs btn-square"
                title="Download .gcode"
                aria-label="Download G-code file"
                :disabled="!hasContent"
                @click="download"
            >
                <Icon name="download" :size="14" />
            </button>
        </div>
        <div v-if="isOpen" class="px-4 pb-4">
            <pre
                v-if="hasContent"
                class="max-h-64 overflow-auto rounded-lg bg-base-300 p-3 text-xs leading-5 text-base-content/80"
                >{{ text }}</pre
            >
            <p v-else class="text-xs text-base-content/50">
                Nothing to plot yet.
            </p>
        </div>
    </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import { useIndexStore } from '@/store/index'
import { useToast } from '@/composables/useToast'

const store = useIndexStore()
const { notify } = useToast()
const isOpen = ref(false)

const lineCount = computed(() => store.gCode.length.toLocaleString())
const hasContent = computed(() => store.gCode.length > 0)
const text = computed(() => (isOpen.value ? store.gCode.join('\n') : ''))

const copy = async () => {
    try {
        await navigator.clipboard.writeText(store.gCode.join('\n'))
        notify('G-code copied to clipboard', 'success', 2000)
    } catch {
        notify('Could not copy G-code', 'error')
    }
}

const download = () => {
    const blob = new Blob([store.gCode.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'stylo.gcode'
    link.click()
    URL.revokeObjectURL(url)
}
</script>
