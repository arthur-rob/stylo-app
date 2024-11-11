import axios from 'axios'
import Stylo from '@/lib/Stylo'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const Axios = axios.create({
    baseURL: 'http://localhost:3000/'
})

export const useIndexStore = defineStore('index', () => {
    const plotters = ref([])
    const stylo = new Stylo()

    const syncPlotter =  async () => {
        try {
            plotters.value = await Axios.get('/plotter/list')
        } catch (error) {
            console.error('Plotter list Unavailable')
            throw error
        }
    }

    return {
        stylo,
        plotters,
        syncPlotter
    };
});