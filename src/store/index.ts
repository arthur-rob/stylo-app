import axios from 'axios'
import { Plotter, PlotterInput, SerialPortInfo } from '@/models/plotter'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import Controls from '@/lib/Controls'

const Axios = axios.create({
    baseURL: 'http://localhost:3000/',
})

const ACTIVE_PLOTTER_KEY = 'stylo.activePlotterId'
const readActivePlotterId = () => {
    try {
        return localStorage.getItem(ACTIVE_PLOTTER_KEY)
    } catch {
        return null
    }
}

// Message sent by the server, or a fallback when it is unreachable
export const apiErrorMessage = (error: unknown, fallback: string) =>
    (axios.isAxiosError(error) && error.response?.data?.message) || fallback

export const useIndexStore = defineStore('index', () => {
    const plotters = ref<Plotter[]>([])
    const activePlotter = ref<Plotter | null>(null)
    const ports = ref<SerialPortInfo[] | null>(null)
    const gCode = ref<string[]>([])
    const isDrawing = ref<boolean>(false)
    // last known pen position, null until a command has been sent
    const penDown = ref<boolean | null>(null)
    const connection = ref<'connecting' | 'online' | 'offline'>('connecting')
    const syncPlotter = async () => {
        connection.value = 'connecting'
        try {
            const response = await Axios.get('/plotter/list')
            plotters.value = response.data
            const activeId = activePlotter.value?._id || readActivePlotterId()
            activePlotter.value =
                plotters.value.find((plotter) => plotter._id === activeId) ||
                plotters.value[0] ||
                null
            connection.value = 'online'
        } catch (error) {
            connection.value = 'offline'
            console.error('Plotter list Unavailable')
            throw error
        }
    }

    const setActivePlotter = (plotter: Plotter) => {
        activePlotter.value = plotter
        try {
            localStorage.setItem(ACTIVE_PLOTTER_KEY, plotter._id)
        } catch {
            // the choice is only kept for this session
        }
    }

    const discoverPorts = async () => {
        try {
            const response = await Axios.get('/plotter/discover')
            ports.value = response.data
        } catch (error) {
            ports.value = null
            throw error
        }
    }

    const registerPlotter = async (input: PlotterInput) => {
        await Axios.post('/plotter/register', input)
        await syncPlotter()
    }

    const updatePlotter = async (id: string, input: Partial<PlotterInput>) => {
        await Axios.patch(`/plotter/${id}`, input)
        await syncPlotter()
    }

    const deletePlotter = async (id: string) => {
        await Axios.delete(`/plotter/${id}`)
        if (activePlotter.value?._id === id) activePlotter.value = null
        await syncPlotter()
    }

    const execute = async (commands: string[]) => {
        try {
            isDrawing.value = true
            await Axios.post('/plotter/execute', {
                plotterId: activePlotter.value?.name,
                gCode: commands,
            })
            // every generated program ends with the pen lifted
            penDown.value = false
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
    const setPen = async (down: boolean) => {
        await execute(Controls.generatePenCommand(down))
        penDown.value = down
    }
    const moveTo = async (x: number, y: number) => {
        const resetCommands = Controls.generateManualCommand(x, y)
        await execute(resetCommands)
    }

    return {
        plotters,
        ports,
        gCode,
        connection,
        syncPlotter,
        setActivePlotter,
        discoverPorts,
        registerPlotter,
        updatePlotter,
        deletePlotter,
        execute,
        activePlotter,
        draw,
        resetPen,
        penDown,
        setPen,
        moveTo,
        isDrawing,
    }
})
