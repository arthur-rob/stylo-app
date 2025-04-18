import Geometry from '@/lib/geometry/Index'

class Polygone extends Geometry {
    constructor(points) {
        super({ type: 'polygone' })
        this.points = points
        this.path = this.create()
        this.closeGeometry()
    }
    create() {
        const points = this.points.map((el) => ({
            x: el[0],
            y: el[1],
            isGap: false,
        }))
        points.unshift({
            x: this.points[0][0],
            y: this.points[0][1],
            isGap: true,
        })
        points.push({
            x: this.points[0][0],
            y: this.points[0][1],
            isGap: false,
        })
        return points
    }
}
export default Polygone
