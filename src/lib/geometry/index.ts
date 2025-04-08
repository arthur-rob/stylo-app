import { Coordinate, GeoOptions } from '@/models/lib'

class Geometry {
    path: Coordinate[]
    name: string
    constructor(args: Geometry) {
        this.name = args.name || ''
        this.path = args.path || []
    }
    draw(context: CanvasRenderingContext2D, options: GeoOptions = {}) {
        const scale = options.scale || 1
        const coordStart = this.path[1]
        context.beginPath()
        context.moveTo(coordStart.x * scale, coordStart.y * scale)
        context.lineWidth = 1
        context.strokeStyle = options.color || '#000000'
        for (let i = 0; i < this.path.length; i++) {
            const coord = this.path[i]
            if (coord.isGap) context.moveTo(coord.x * scale, coord.y * scale)
            else context.lineTo(coord.x * scale, coord.y * scale)
        }
        context.stroke()
        context.closePath()
    }
    closeGeometry() {
        const last = Object.assign(this.path[0], { isGap: false })
        return this.path.push(last)
    }
}
export default Geometry
