import Geometry from "@/lib/geometry/Index"
import { Coordinate } from "@/models/lib"
interface Settings {
    gcode: {
        unit: string
        speed: string
        mode: string
        zAxisUp: string
        zAxisDown: string
        xAxis: string
        yAxis: string
        baseCommand: string
        revertAxisX: boolean
        revertAxisY: boolean
    }
    layout: {
        width: number,
        height: number
    }
}

class Control {
    settings: Settings
    finalSteps: string[]
    initialSteps: string[]
    gcodeCommands: string[]
    isPreviousCoordGap: boolean | undefined
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
        this.isPreviousCoordGap = false
    }
    init () {
        var setup = []
        setup.push(this.settings.gcode.unit)
        setup.push(this.settings.gcode.speed)
        setup.push(this.settings.gcode.mode)
        setup.push(this.settings.gcode.zAxisUp)
        return setup
    }
    backToZero () {
        var finalSteps = []
        finalSteps.push(this.settings.gcode.zAxisUp)
        finalSteps.push(`${this.settings.gcode.baseCommand} X0 Y0`)
        return finalSteps
    }
    getMinMaxPos (pos: Coordinate) {
        var noNegative = {
            x: Math.max(pos.x, 0),
            y: Math.max(pos.y, 0)
        }
        return {
            x: Math.min(noNegative.x, this.settings.layout.width),
            y: Math.min(noNegative.y, this.settings.layout.height)
        }
    }
    generate (geometries: Geometry[]) {
        var commands = this.initialSteps
        for (var i = 0; i < geometries.length; i++) {
            var element = geometries[i]
            var tmpSteps = this.beforeGenerateDraw(element)
            for (var j = 0; j < element.path.length; j++) {
                var coords = element.path[j]
                var maxPos = this.getMinMaxPos(coords)
                if (this.isPreviousCoordGap != coords.isGap) tmpSteps.push(coords.isGap ? this.settings.gcode.zAxisUp : this.settings.gcode.zAxisDown )
                tmpSteps.push(this.comptudeCoordSteps(maxPos.x, maxPos.y))
                this.isPreviousCoordGap = coords.isGap
            }
            tmpSteps.push(this.settings.gcode.zAxisUp)
            this.isPreviousCoordGap = true
            commands = commands.concat(tmpSteps)
        }   
        commands = commands.concat(this.finalSteps)
        return commands.join('\n')
    }
    comptudeCoordSteps (x: number, y: number) {
        return `${this.settings.gcode.baseCommand} X${this.settings.gcode.revertAxisX ? x * -1: x} Y${this.settings.gcode.revertAxisY ? y * -1: y}`
    }
    beforeGenerateDraw (element: Geometry) {
        var before = []
        var coords = this.getMinMaxPos(element.path[0])
        before.push(this.comptudeCoordSteps(coords.x, coords.y))
        before.push(this.settings.gcode.zAxisDown)
        this.isPreviousCoordGap = false
        return before
    }
}

export default new Control()
