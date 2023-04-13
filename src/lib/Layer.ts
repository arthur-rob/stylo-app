class Layer {
    constructor (options) {
        this.id = options.id || this.generateId()
        this.geometries = []
        this.strokeWidth = options.strokeWidth || 1
        this.strokeColor = options.color || '#000'
    }
    generateId () {
        return (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6);
    }
    add (element) {
        this.geometries.push(element)
    }
    render (context) {
        this.geometries.forEach(geo => geo.draw(context))
    }
}
export default Layer