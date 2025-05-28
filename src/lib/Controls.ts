import Geometry from '@/lib/geometry/Geometry'
import Vector from '@/lib/core/Vector'
import { sutherlandHodgmanClip } from '@/lib/helpers'
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
        width: number
        height: number
    }
}

class Control {
    settings: Settings
    finalSteps: string[]
    initialSteps: string[]
    gcodeCommands: string[]
    constructor() {
        this.settings = {
            layout: {
                width: 148,
                height: 210,
            },
            gcode: {
                unit: 'G21', // units in mm by default
                zAxisDown: 'S100 M3',
                zAxisUp: 'S0 M5',
                xAxis: 'X',
                yAxis: 'Y',
                revertAxisX: true,
                revertAxisY: false,
                baseCommand: 'G01',
                mode: 'E2 A1', // Servo mode in mm by default
                speed: 'F5000',
            },
        }
        this.initialSteps = this.init()
        this.finalSteps = this.backToZero()
        this.gcodeCommands = []
    }
    init() {
        const setup = []
        setup.push(this.settings.gcode.unit)
        setup.push(this.settings.gcode.speed)
        setup.push(this.settings.gcode.mode)
        setup.push(this.settings.gcode.zAxisUp)
        return setup
    }
    backToZero() {
        const finalSteps = []
        finalSteps.push(this.settings.gcode.zAxisUp)
        finalSteps.push(`${this.settings.gcode.baseCommand} X0 Y0`)
        return finalSteps
    }
    generate(geometries: Geometry[]): string[] {
        let commands = this.initialSteps
        for (let i = 0; i < geometries.length; i++) {
            const element = geometries[i]
            const elementGCodes = this.getGCodeForElement(element)
            commands = commands.concat(elementGCodes)
        }
        commands = commands.concat(this.finalSteps)
        return commands
    }
    getClipPolygon(): Vector[] {
        return [
            new Vector(0, 0),
            new Vector(this.settings.layout.width, 0),
            new Vector(this.settings.layout.width, this.settings.layout.height),
            new Vector(0, this.settings.layout.height),
        ]
    }
    getGCodeForElement(element: Geometry): string[] {
        const drawElementSteps = []
        const clippedVectors = sutherlandHodgmanClip(
            element.path,
            this.getClipPolygon()
        )
        if (clippedVectors.length < 1) return []

        const moveToElementSteps = this.beforeElementDraw(clippedVectors)
        for (let j = 0; j < clippedVectors.length; j++) {
            const vector = clippedVectors[j]
            drawElementSteps.push(this.comptudeCoordSteps(vector.x, vector.y))
        }
        const afterElementSteps = this.afterElementDraw()
        return [
            ...moveToElementSteps,
            ...drawElementSteps,
            ...afterElementSteps,
        ]
    }
    comptudeCoordSteps(x: number, y: number): string {
        return `${this.settings.gcode.baseCommand} X${this.settings.gcode.revertAxisX ? x * -1 : x} Y${this.settings.gcode.revertAxisY ? y * -1 : y}`
    }
    beforeElementDraw(vectors: Vector[]): string[] {
        const before = []
        before.push(this.comptudeCoordSteps(vectors[0].x, vectors[0].y))
        before.push(this.settings.gcode.zAxisDown)
        return before
    }
    afterElementDraw(): string[] {
        return [this.settings.gcode.zAxisUp]
    }
}

export default new Control()
