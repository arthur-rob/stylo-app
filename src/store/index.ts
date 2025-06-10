import axios from 'axios'
import { Plotter } from '@/models/plotter'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import Controls from '@/lib/Controls'

const Axios = axios.create({
    baseURL: 'http://localhost:3000/',
})

export const useIndexStore = defineStore('index', () => {
    const plotters = ref<Plotter[]>([])
    const activePlotter = ref<Plotter | null>(null)
    const gCode = ref<string[]>([])
    const isDrawing = ref<boolean>(false)
    const syncPlotter = async () => {
        try {
            const response = await Axios.get('/plotter/list')
            plotters.value = response.data
            activePlotter.value = plotters.value[0] || null
        } catch (error) {
            console.error('Plotter list Unavailable')
            throw error
        }
    }

    const execute = async (commands: string[]) => {
        try {
            isDrawing.value = true
            await Axios.post('/plotter/execute', {
                plotterId: activePlotter.value?.name,
                gCode: commands,
            })
        } catch (error) {
            console.error('Draw Failed')
            throw error
        } finally {
            isDrawing.value = false
        }
    }

    const draw = async () => {
        await execute(gCode.value)
    }

    const resetPen = async () => {
        const resetCommands = Controls.generateUnstuckPenCommand()
        await execute(resetCommands)
    }
    const moveTo = async (x: number, y: number) => {
        const resetCommands = Controls.generateManualCommand(x, y)
        await execute(resetCommands)
    }

    return {
        plotters,
        gCode,
        syncPlotter,
        activePlotter,
        draw,
        resetPen,
        moveTo,
        isDrawing,
    }
})
