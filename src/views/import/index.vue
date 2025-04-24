<template>
    <EditorLayout>
        <div class="svg-import-action">
            <h3 class="text-2xl">Import Svg File</h3>
            <div class="file-input-containe">
                <label
                    class="block my-4 text-sm font-medium text-gray-900 dark:text-white"
                    for="file_input"
                >
                    <span class="sr-only cursor-pointer">Svg File</span>
                    <input
                        id="file_input"
                        class="block w-full text-sm text-gray-500 file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:disabled:opacity-50 file:disabled:pointer-events-none cursor-pointer dark:text-neutral-500 dark:file:bg-blue-500 dark:hover:file:bg-blue-400"
                        type="file"
                        accept=".svg"
                        @change="handleFileImport"
                    />
                </label>
            </div>
        </div>
    </EditorLayout>
</template>

<script setup lang="ts">
import EditorLayout from '@/layouts/EditorLayout.vue'
import { ref, onMounted } from 'vue'
import Stylo from '@/lib/Stylo'

const stylo = new Stylo()
const SVG = ref<string>('')

onMounted(async () => {
    stylo.init('#stylo', { renderSize: 2 })
    stylo.render()
})

const handleFileImport = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || !input.files[0]) return

    const file = input.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
        const svgContent = e.target?.result as string
        SVG.value = svgContent
    }

    reader.onerror = (e) => {
        console.error('Error reading file:', e)
    }

    reader.readAsText(file)
}
</script>
<style scoped lang="scss"></style>
