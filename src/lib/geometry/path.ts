import Vector from '@/lib/core/Vector'
import Geometry from '@/lib/geometry/Geometry'

export default class Path extends Geometry {
    constructor(public path: Vector[]) {
        super({ path, type: 'path' })
    }
}
