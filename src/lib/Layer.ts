import Geometry from './geometry/Geometry'

interface LayerArgs {
    id?: string
    strokeWidth?: number
    color?: string
}

class Layer {
    id?: string
    geometries: Geometry[]
    strokeWidth?: number
    color?: string

    constructor(layerParams: LayerArgs = {}) {
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
    scale(factor: number) {
        this.geometries.forEach((geo) => {
            geo.path = geo.path.map((vector) => vector.scale(factor))
        })
    }
    render(context: CanvasRenderingContext2D) {
        this.geometries.forEach((geo) =>
            geo.draw(context, { color: this.color })
        )
    }
}
export default Layer
