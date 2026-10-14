import Geometry from './geometry/Geometry'
import Vector from '@/lib/core/Vector'
import { clipPolyline, isPathCropped } from '@/lib/helpers'
import { Rect } from '@/models/lib'

interface LayerArgs {
    id?: string
    name?: string
    strokeWidth?: number
    color?: string
    source?: string
}

interface LayerRenderOptions {
    clip?: Rect
    lineWidth?: number
}

class Layer {
    id: string
    name: string
    geometries: Geometry[]
    strokeWidth: number
    color: string
    visible: boolean
    // transform applied to geometries on render and G-code generation, in mm
    scaleFactor: number
    offset: Vector
    // layers imported from the same file share a source and move together
    source?: string

    constructor(layerParams: LayerArgs = {}) {
        this.id = layerParams.id || this.generateId()
        this.name = layerParams.name || `Layer ${this.id}`
        this.geometries = []
        this.strokeWidth = layerParams.strokeWidth || 0.4
        this.color = layerParams.color || '#000'
        this.visible = true
        this.scaleFactor = 1
        this.offset = new Vector(0, 0)
        this.source = layerParams.source
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
    getPaths(): Vector[][] {
        const { scaleFactor, offset } = this
        if (scaleFactor === 1 && offset.x === 0 && offset.y === 0)
            return this.geometries.map((geo) => geo.path)
        return this.geometries.map((geo) =>
            geo.path.map(
                (v) =>
                    new Vector(
                        v.x * scaleFactor + offset.x,
                        v.y * scaleFactor + offset.y
                    )
            )
        )
    }
    // Bounds of the untransformed geometries
    getSourceBounds(): Rect | null {
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        for (const geo of this.geometries) {
            for (const v of geo.path) {
                if (v.x < minX) minX = v.x
                if (v.y < minY) minY = v.y
                if (v.x > maxX) maxX = v.x
                if (v.y > maxY) maxY = v.y
            }
        }
        if (minX === Infinity) return null
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    }
    getBounds(): Rect | null {
        const bounds = this.getSourceBounds()
        if (!bounds) return null
        return {
            x: bounds.x * this.scaleFactor + this.offset.x,
            y: bounds.y * this.scaleFactor + this.offset.y,
            width: bounds.width * this.scaleFactor,
            height: bounds.height * this.scaleFactor,
        }
    }
    // Scale and move the layer so it fills the area, keeping its ratio
    fitTo(area: Rect, margin = 0) {
        fitLayersTo([this], area, margin)
    }
    countCroppedPaths(area: Rect): number {
        return this.getPaths().filter((path) => isPathCropped(path, area))
            .length
    }
    render(
        context: CanvasRenderingContext2D,
        options: LayerRenderOptions = {}
    ) {
        const lineWidth = Math.max(this.strokeWidth, options.lineWidth || 0)
        const paths = this.getPaths()
        context.lineWidth = lineWidth
        context.strokeStyle = this.color

        if (!options.clip) {
            paths.forEach((path) => strokePath(context, path))
            return
        }

        // parts outside the drawable area are shown as a faint ghost
        const clip = options.clip
        context.save()
        context.globalAlpha = 0.18
        paths
            .filter((path) => isPathCropped(path, clip))
            .forEach((path) => strokePath(context, path))
        context.restore()

        paths.forEach((path) =>
            clipPolyline(path, clip).forEach((clipped) =>
                strokePath(context, clipped)
            )
        )
    }
}

export function unionBounds(rects: (Rect | null)[]): Rect | null {
    const boxes = rects.filter((rect): rect is Rect => !!rect)
    if (boxes.length === 0) return null
    const minX = Math.min(...boxes.map((box) => box.x))
    const minY = Math.min(...boxes.map((box) => box.y))
    const maxX = Math.max(...boxes.map((box) => box.x + box.width))
    const maxY = Math.max(...boxes.map((box) => box.y + box.height))
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

// Fit layers as one drawing: they all get the same scale and offset to stay aligned
export function fitLayersTo(layers: Layer[], area: Rect, margin = 0) {
    const bounds = unionBounds(layers.map((layer) => layer.getSourceBounds()))
    if (!bounds || (bounds.width === 0 && bounds.height === 0)) return
    const width = area.width - margin * 2
    const height = area.height - margin * 2
    const scale = Math.min(
        bounds.width ? width / bounds.width : Infinity,
        bounds.height ? height / bounds.height : Infinity
    )
    const offset = new Vector(
        area.x + (area.width - bounds.width * scale) / 2 - bounds.x * scale,
        area.y + (area.height - bounds.height * scale) / 2 - bounds.y * scale
    )
    layers.forEach((layer) => {
        layer.scaleFactor = scale
        layer.offset = offset
    })
}

function strokePath(context: CanvasRenderingContext2D, path: Vector[]) {
    if (path.length < 1) return
    context.beginPath()
    context.moveTo(path[0].x, path[0].y)
    for (let i = 1; i < path.length; i++) context.lineTo(path[i].x, path[i].y)
    context.stroke()
}

export default Layer
