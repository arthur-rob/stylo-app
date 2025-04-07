import Geometry from '@/lib/geometry/Index'

export default class Circle extends Geometry {
    constructor(x = 0, y = 0, radius = 20, args = {}) {
        super({ type: 'circle' })
        this.x = x
        this.resolution = args.resolution || 99
        this.y = y
        this.radius = radius
        this.path = this.create()
        this.closeGeometry()
    }
    create() {
        const tmpPath = []
        for (let i = 0; i < 2 * Math.PI; i += (2 * Math.PI) / this.resolution) {
            const obj = {
                x: Math.cos(i) * this.radius + this.x,
                y: this.y - Math.sin(i) * this.radius,
                isGap: false,
            }
            tmpPath.push(obj)
        }
        return tmpPath
    }
}
