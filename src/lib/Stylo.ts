import Layer from './Layer.ts'
class Stylo {
    constructor (size = "A4", args = {}) {
        this.canvasSelector = "#stylo"
        this.canvas = undefined
        this.mapedSize = this.mapSize(size)
        this.scale = args.scale || 1
        this.width = args.width || this.mapedSize.width
        this.height = args.height || this.mapedSize.height
        this.layers = [new Layer(1)]
    }
    mapSize (size) {
        const format = {
            'A5' : {
                width: 148,
                height: 210
            },
            'A4': {
                width: 210,
                height: 297
            }
        }
        return format[size]
    }
    init (id, options = { }) {
        var canvas = document.querySelector(id || this.canvasSelector)
        if (!canvas) console.error('Can\'t find container element')
        canvas.width = options.width || this.width
        canvas.height = options.height || this.height
        this.canvas = canvas

        this.scale = options.renderSize || 1
        this.scaleCanvas()

        this.context = canvas.getContext('2d')
        
        return canvas
    }
    getContext () {
        return this.context
    }
    scaleCanvas () {
        this.canvas.width = this.width * this.scale
        this.canvas.height = this.height * this.scale
    }
    add (element, layerId) {
        if (!element) return console.log('Argument need to be a geometry')
        if(!layerId) this.layers[0].add(element)
        else {
            console.error('Not Implemented')
        }
    }
    render (args) {
        this.scaleCanvas()
        if (this.layers.length < 1) return
        this.layers.forEach(layer => {
            layer.render(this.context, this.scale)
        })
    }
    clear () {
        this.reset()
        this.canvas.width = this.canvas.width
    }
    reset () {
        this.layers = [new Layer()]
    }
    getGeometriesByLayer (layerId) {
        // Implement into Geometries First
    }
    getGcode (ploElements) {
        if (typeof ploElements == 'undefined') ploElements = this.ploGeometries
        return Controls.generate(ploElements)
    }
    sendToPlotter (ploGeometry) {
        var data = this.getGcode(ploGeometry)
        return this.request('plotter_draw', data)
    }
    resetPlotter () {
        return this.request('plotter_reset')
    }
    listPlotter() {
        return this.request('plotter_list_port').then(res => console.log(res))  
    }
    request (url, data = {}) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest()
            request.open('POST', `http://localhost:8888/${url}`, true)
            request.setRequestHeader('Content-type', 'application/json; charset=utf-8')
            request.onreadystatechange = () => {
              if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
                    resolve(request.response)
              } else if (request.readyState === XMLHttpRequest.DONE) { reject(request) }
            }
            request.send(JSON.stringify({data: data}))
        })
    }
}
export default Stylo