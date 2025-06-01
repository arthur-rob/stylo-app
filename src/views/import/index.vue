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
                        class="w-full text-sm file-input file-input-ghost"
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
import { onMounted } from 'vue'
import Path from '@/lib/geometry/Path'
import { svgToVector, SvgCommand } from '@/lib/SvgToVector'
import { parseSVG } from 'svg-path-parser'
import Stylo from '@/lib/Stylo'
import { useIndexStore } from '@/store/index'

const store = useIndexStore()
const stylo = new Stylo()

onMounted(async () => {
    stylo.init('#stylo', { renderSize: 2, scale: 0.2 })
    stylo.render()
})

const handleFileImport = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || !input.files[0]) return

    const file = input.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
        const svgContent = e.target?.result as string
        parseSVGContent(svgContent)
    }

    reader.onerror = (e) => {
        console.error('Error reading file:', e)
    }

    reader.readAsText(file)
}

const parseSVGContent = (svgContent: string) => {
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
    const paths = svgDoc.querySelectorAll('path')
    const parsedPaths: SvgCommand[] = []

    paths.forEach((path) => {
        const d = path.getAttribute('d')
        if (!d) return
        parsedPaths.push(parseSVG(d))
    })
    drawPaths(parsedPaths)
}
const drawPaths = (paths: SvgCommand[][]) => {
    paths.forEach((pathData) => {
        const newPathsCollection = svgToVector(pathData)
        newPathsCollection.forEach((newPath) => {
            stylo.add(new Path(newPath))
        })
    })
    const scale = 0.1
    stylo.layers[0].scale(scale)
    stylo.render()
    store.gCode = stylo.generateGCode()
}
</script>
<style scoped lang="scss"></style>
