import Geometry from './geometry/Geometry'

class Layer {
    id?: string
    geometries: Geometry[]
    strokeWidth?: number
    color?: string

    constructor(layerParams: Partial<Layer> = {}) {
        this.id = layerParams.id || this.generateId()
        this.geometries = []
        this.strokeWidth = layerParams.strokeWidth || 1
        this.color = layerParams.color || '#000'
    }
    generateId() {
        return (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6)
    }
    add(element: Geometry) {
        this.geometries.push(element)
    }
    render(context: CanvasRenderingContext2D, scale: number) {
        this.geometries.forEach((geo) =>
            geo.draw(context, { scale: scale, color: this.color })
        )
    }
}
export default Layer
