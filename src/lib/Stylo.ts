import Layer from '@/lib/Layer'
import Controls from '@/lib/Controls'
import { Box, PaperSize } from '@/models/lib'
import Geometry from './geometry/Index'
import axios from 'axios'

const Axios = axios.create({
    baseURL: 'http://localhost:3000/',
})
class Stylo {
    canvasSelector: string
    canvas?: HTMLCanvasElement
    mapedSize: Box
    scale: number
    width: number
    height: number
    layers: Layer[]
    context: CanvasRenderingContext2D | null

    constructor(size: PaperSize = 'A4', args: Partial<Stylo> = {}) {
        this.canvasSelector = '#stylo'
        this.canvas = undefined
        this.mapedSize = this.mapSize(size)
        this.scale = args.scale || 1
        this.width = args.width || this.mapedSize.width
        this.height = args.height || this.mapedSize.height
        this.layers = [new Layer()]
        this.context = null
    }
    mapSize(size: PaperSize): Box {
        const format = {
            A5: {
                width: 148,
                height: 210,
            },
            A4: {
                width: 210,
                height: 297,
            },
        }
        return format[size]
    }
    init(id: string, options = {}) {
        const canvas = document.querySelector(
            id || this.canvasSelector
        ) as HTMLCanvasElement
        if (!canvas) console.error("Can't find container element")
        canvas.width = options.width || this.width
        canvas.height = options.height || this.height
        this.canvas = canvas

        this.scale = options.renderSize || 1
        this.scaleCanvas()

        this.context = canvas.getContext('2d')

        return canvas
    }
    getContext() {
        return this.context
    }
    scaleCanvas() {
        if (!this.canvas) return
        this.canvas.width = this.width * this.scale
        this.canvas.height = this.height * this.scale
    }
    add(element: Geometry, layerId?: string) {
        if (!element) return console.log('Argument need to be a geometry')
        if (!layerId) this.layers[0].add(element)
        else {
            console.error('Not Implemented')
        }
    }
    render() {
        this.scaleCanvas()
        if (this.layers.length < 1) return
        this.layers.forEach((layer) => {
            layer.render(this.context, this.scale)
        })
    }
    clear() {
        this.reset()
        // eslint-disable-next-line no-self-assign
        if (this.canvas) this.canvas.width = this.canvas.width
    }
    reset() {
        this.layers = [new Layer()]
    }
    getGeometriesByLayer() {
        // Implement into Geometries First
    }
    getGcode(ploElements?: Geometry[]) {
        if (typeof ploElements == 'undefined')
            ploElements = this.layers[0].geometries
        return Controls.generate(ploElements)
    }
    async sendToPlotter(geometries: Geometry[]) {
        const data = this.getGcode(geometries)
        return Axios.post('/plotter/draw', { data })
    }
    resetPlotter() {
        return Axios.get('/plotter/reset')
    }
    async listPlotter() {
        return await Axios.get('/plotter/list')
            .then((response) => {
                return response.data
            })
            .catch(() => {
                console.error('Plotter list Unavailable')
            })
    }
}
export default Stylo
