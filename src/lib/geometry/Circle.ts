import Vector from '@/lib/core/Vector'
import Geometry from '@/lib/geometry/Geometry'

interface CircleArgs {
    resolution?: number
}
export default class Circle extends Geometry {
    center: Vector
    resolution: number
    radius: number

    constructor(x = 0, y = 0, radius = 20, args: CircleArgs = {}) {
        super({ path: [], type: 'circle' })
        this.center = new Vector(x, y)
        this.radius = radius
        this.resolution = args.resolution || 99
        this.path = this.create()
    }

    create(): Vector[] {
        const circlePath: Vector[] = []
        for (let i = 0; i < 2 * Math.PI; i += (2 * Math.PI) / this.resolution) {
            const obj = this.center.add(
                new Vector(Math.cos(i) * this.radius, Math.sin(i) * this.radius)
            )
            circlePath.push(obj)
        }
        return circlePath
    }
}
