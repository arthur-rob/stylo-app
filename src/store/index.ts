import axios from 'axios'
import { Plotter } from '@/models/plotter'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const Axios = axios.create({
    baseURL: 'http://localhost:3000/',
})

export const useIndexStore = defineStore('index', () => {
    const plotters = ref<Plotter[]>([])
    const activePlotter = ref<Plotter | null>(null)
    const gCode = ref<string[]>([])

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

    const draw = async () => {
        try {
            await Axios.post('/plotter/draw', {
                plotterId: activePlotter.value?.name,
                gCode: gCode.value,
            })
        } catch (error) {
            console.error('Draw Failed')
            throw error
        }
    }

    return {
        plotters,
        gCode,
        syncPlotter,
        activePlotter,
        draw,
    }
})
