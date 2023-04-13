import Geometry from '@/lib/geometry/index' 
class Square extends Geometry {
	constructor(x = 0, y = 0, width = 20) {
	    super({ type: 'square'})
	    this.x = x
	    this.y = y
	    this.width = width
	    this.path = this.create()
	    this.closeGeometry()
	}
	create () {
		return [
	    	{ x: this.x, y: this.y, isGap: true},
	    	{ x: this.x, y: this.y + this.width, isGap: false},
	    	{ x: this.x + this.width, y: this.y + this.width, isGap: false},
	    	{ x: this.x + this.width, y: this.y, isGap: false},
	    ]
	}

}
export default Square