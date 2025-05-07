import { GeoOptions } from '@/models/lib'
import Vector from '@/lib/core/Vector'

interface GeometryArgs {
    path?: Vector[]
    id?: string
    type?: string
}

export default class Geometry {
    path: Vector[]
    id?: string
    type: string

    constructor(args: GeometryArgs) {
        this.id = args.id || ''
        this.path = args.path || []
        this.type = args.type || 'geometry'
    }

    public draw(context: CanvasRenderingContext2D, options: GeoOptions = {}) {
        const pathStart = this.path[0]
        context.beginPath()
        context.moveTo(pathStart.x, pathStart.y)
        context.lineWidth = 1
        context.strokeStyle = options.color || '#000000'
        for (let i = 1; i < this.path.length; i++) {
            const vector = this.path[i]
            context.lineTo(vector.x, vector.y)
        }
        context.stroke()
        context.closePath()
    }
}
