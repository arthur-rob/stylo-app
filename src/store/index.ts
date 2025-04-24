import axios from 'axios'
import Stylo from '@/lib/Stylo'
import { Plotter } from '@/models/plotter'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const Axios = axios.create({
    baseURL: 'http://localhost:3000/',
})

export const useIndexStore = defineStore('index', () => {
    const plotters = ref<Plotter[]>([])
    const activePlotter = ref<Plotter | null>(null)
    const stylo = new Stylo()

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

    return {
        stylo,
        plotters,
        syncPlotter,
        activePlotter,
    }
})
