import Geometry from '@/lib/geometry/Geometry'
import Vector from '@/lib/core/Vector'

export default class Square extends Geometry {
    start: Vector
    width: number

    constructor(x = 0, y = 0, width: number = 20) {
        super({ type: 'square' })
        this.start = new Vector(x, y)
        this.width = width
        this.path = this.create()
    }
    create(): Vector[] {
        return [
            this.start,
            this.start.add(new Vector(this.width, 0)),
            this.start.add(new Vector(this.width, this.width)),
            this.start.add(new Vector(0, this.width)),
            this.start,
        ]
    }
}
