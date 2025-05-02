import Layer from '@/lib/Layer'
import Controls from '@/lib/Controls'
import { Box, PaperSize } from '@/models/lib'
import Geometry from '@/lib/geometry/Geometry'

interface StyloArgs {
    width?: number
    height?: number
    renderSize?: number
    canvasSelector?: string
    canvas?: HTMLCanvasElement
    mapedSize?: Box
}
class Stylo {
    canvasSelector: string
    canvas?: HTMLCanvasElement
    mapedSize: Box
    renderSize: number
    width: number
    height: number
    layers: Layer[]
    context: CanvasRenderingContext2D | null

    constructor(size: PaperSize = 'A4', args: StyloArgs = {}) {
        this.canvasSelector = '#stylo'
        this.canvas = undefined
        this.mapedSize = this.mapSize(size)
        this.renderSize = args.renderSize || 1
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
    init(id: string, options: StyloArgs = {}) {
        const canvas = document.querySelector(
            id || this.canvasSelector
        ) as HTMLCanvasElement
        if (!canvas) console.error("Can't find container element")
        canvas.width = options.width || this.width
        canvas.height = options.height || this.height
        this.canvas = canvas

        this.renderSize = options.renderSize || 1
        this.scaleCanvas()

        this.context = canvas.getContext('2d')

        return canvas
    }
    getContext() {
        return this.context
    }
    scaleCanvas() {
        if (!this.canvas) return
        this.canvas.width = this.width * this.renderSize
        this.canvas.height = this.height * this.renderSize
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
        if (this.layers.length < 1 || !this.context) return
        this.layers.forEach((layer) => {
            layer.render(this.context)
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
    generateGCode(geometries?: Geometry[]): string[] {
        if (typeof geometries == 'undefined')
            geometries = this.layers[0].geometries
        return Controls.generate(geometries)
    }
}
export default Stylo
