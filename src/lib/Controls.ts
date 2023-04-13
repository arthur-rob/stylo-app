class Control {
    constructor () {
        this.settings = {
            layout: {
                width: 148,
                height: 210
            },  
            gcode: {
                unit: 'G21',// units in mm by default
                zAxisDown: "S1000 M3",
                zAxisUp: "S0 M5",
                xAxis: 'X',
                yAxis: 'Y',
                revertAxisX: true,
                revertAxisY: false,
                baseCommand: "G01",
                mode: 'E2 A1', // Servo mode in mm by default
                speed: 'F5000'
            }
        }
        this.initialSteps = this.init()
        this.finalSteps = this.backToZero()
        this.gcodeCommands = []
    }
    init () {
        var setup = []
        setup.push(settings.gcode.unit)
        setup.push(settings.gcode.speed)
        setup.push(settings.gcode.mode)
        setup.push(settings.gcode.zAxisUp)
        return setup
    }
    backToZero () {
        var finalSteps = []
        finalSteps.push(settings.gcode.zAxisUp)
        finalSteps.push(`${settings.gcode.baseCommand} X0 Y0`)
        return finalSteps
    }
    getMinMaxPos (pos) {
        var noNegative = {
            x: Math.max(pos.x, 0),
            y: Math.max(pos.y, 0)
        }
        return {
            x: Math.min(noNegative.x, settings.layout.width),
            y: Math.min(noNegative.y, settings.layout.height)
        }
    }
    generate (geometries) {
        var commands = this.initialSteps
        for (var i = 0; i < geometries.length; i++) {
            var element = geometries[i]
            var tmpSteps = this.beforeGenerateDraw(element)
            for (var j = 0; j < element.path.length; j++) {
                var coords = element.path[j]
                var maxPos = this.getMinMaxPos(coords)
                if (this.lastGap != coords.isGap) tmpSteps.push(coords.isGap ? settings.gcode.zAxisUp : settings.gcode.zAxisDown )
                tmpSteps.push(this.comptudeCoordSteps(maxPos.x, maxPos.y))
                this.lastGap = coords.isGap
            }
            tmpSteps.push(settings.gcode.zAxisUp)
            this.lastGap = true
            commands = commands.concat(tmpSteps)
        }   
        commands = commands.concat(this.finalSteps)
        return commands.join('\n')
    }
    comptudeCoordSteps (x, y) {
        return `${settings.gcode.baseCommand} X${settings.gcode.revertAxisX ? x * -1: x} Y${settings.gcode.revertAxisY ? y * -1: y}`
    }
    beforeGenerateDraw (element) {
        var before = []
        var coords = this.getMinMaxPos(element.path[0])
        before.push(this.comptudeCoordSteps(coords.x, coords.y))
        before.push(settings.gcode.zAxisDown)
        this.lastGap = false
        return before
    }
}

export default new Control()
