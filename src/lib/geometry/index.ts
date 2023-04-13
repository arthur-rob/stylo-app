class Geometry {
	constructor (args) {
		this.name = args.name || ""
		this.path = args.path || []
		this.type = args.type || ""
	} 
	draw (context, options = {}) {
        let scale = options.scale || 1
		var coordStart = this.path[1]
		context.beginPath()
		context.moveTo(coordStart.x * scale, coordStart.y * scale)
        context.lineWidth = 1
		context.strokeStyle = options.color || '#000000'
		for(var i = 0; i < this.path.length; i ++) {
			var coord = this.path[i]
			coord.isGap
				?  context.moveTo(coord.x * scale, coord.y * scale)
				:  context.lineTo(coord.x * scale, coord.y * scale)
		}
		context.stroke()
		context.closePath()
	}
	closeGeometry () {
		var last = Object.assign(this.path[0], { isGap: false })
		return this.path.push(last)
	}
}
export default Geometry