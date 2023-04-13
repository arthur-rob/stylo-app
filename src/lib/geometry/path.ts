import Geometry from '@/lib/geometry/index' 
class Path extends Geometry {
  constructor(points) {
      super({ type: 'path'})
      this.points = points
      this.path = this.create()
  }
  create () {
    var points = this.points.map(el => ({x: el[0], y: el[1], isGap: false}))
    points.unshift({
      x: this.points[0][0],
      y: this.points[0][1],
      isGap: true
    })
    return points
  }

}
export default Path