import Layer from '@/lib/Layer'
import Controls from '@/lib/Controls'
import { Box, PaperSize, Rect } from '@/models/lib'
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
        const layer = layerId ? this.getLayer(layerId) : this.layers[0]
        if (!layer) return console.error(`Layer ${layerId} not found`)
        layer.add(element)
    }
    addLayer(args: ConstructorParameters<typeof Layer>[0] = {}): Layer {
        const layer = new Layer(args)
        this.layers.push(layer)
        return layer
    }
    getLayer(layerId: string): Layer | undefined {
        return this.layers.find((layer) => layer.id === layerId)
    }
    removeLayer(layerId: string) {
        this.layers = this.layers.filter((layer) => layer.id !== layerId)
    }
    clearLayers() {
        this.layers = []
    }
    getDrawableArea(): Rect {
        return Controls.getDrawableArea()
    }
    render() {
        this.scaleCanvas()
        const context = this.context
        if (!context) return
        // draw in mm: one unit = renderSize pixels
        context.setTransform(this.renderSize, 0, 0, this.renderSize, 0, 0)
        context.lineCap = 'round'
        context.lineJoin = 'round'

        const area = this.getDrawableArea()
        const hairline = 1 / this.renderSize
        context.save()
        context.strokeStyle = '#94a3b8'
        context.lineWidth = hairline
        context.setLineDash([2, 1.5])
        context.strokeRect(area.x, area.y, area.width, area.height)
        context.restore()

        this.layers
            .filter((layer) => layer.visible)
            .forEach((layer) =>
                layer.render(context, { clip: area, lineWidth: hairline })
            )
    }
    clear() {
        this.reset()
        // eslint-disable-next-line no-self-assign
        if (this.canvas) this.canvas.width = this.canvas.width
    }
    reset() {
        this.layers = [new Layer()]
    }
    generateGCode(layers?: Layer[]): string[] {
        const target = layers || this.layers.filter((layer) => layer.visible)
        return Controls.generateFromPaths(
            target.flatMap((layer) => layer.getPaths())
        )
    }
}
export default Stylo
