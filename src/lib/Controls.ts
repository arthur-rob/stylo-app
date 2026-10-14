import Geometry from '@/lib/geometry/Geometry'
import Vector from '@/lib/core/Vector'
import { clipPolyline } from '@/lib/helpers'
import { Rect } from '@/models/lib'
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

const round = (value: number) => Math.round(value * 1000) / 1000 || 0

class Control {
    settings: Settings
    finalSteps: string[]
    initialSteps: string[]
    gcodeCommands: string[]
    constructor() {
        this.settings = {
            layout: {
                width: 200,
                height: 287,
            },
            gcode: {
                unit: 'G21', // units in mm by default
                zAxisDown: 'M3 S100',
                zAxisUp: 'M3 S0',
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
    setup() {
        const { unit, speed, mode } = this.settings.gcode
        return [unit, speed, mode]
    }
    init() {
        return [...this.setup(), this.settings.gcode.zAxisUp]
    }
    // Only move the pen servo, without lifting it first like init() does
    generatePenCommand(down: boolean) {
        const { zAxisDown, zAxisUp } = this.settings.gcode
        return [...this.setup(), down ? zAxisDown : zAxisUp]
    }
    generateManualCommand(x: number, y: number) {
        const commands = this.init()
        commands.push(this.comptudeCoordSteps(x, y))
        return commands
    }
    generateUnstuckPenCommand() {
        const commands = this.init()
        commands.push(this.settings.gcode.zAxisDown)
        commands.push('G01 X0.05 Y0.05 F10')
        commands.push(this.settings.gcode.zAxisUp)
        return commands
    }
    backToZero() {
        const finalSteps = []
        finalSteps.push(this.settings.gcode.zAxisUp)
        finalSteps.push(`${this.settings.gcode.baseCommand} X0 Y0`)
        return finalSteps
    }
    generate(geometries: Geometry[]): string[] {
        return this.generateFromPaths(geometries.map((element) => element.path))
    }
    generateFromPaths(paths: Vector[][]): string[] {
        const commands = [...this.initialSteps]
        for (const path of paths) {
            for (const step of this.getGCodeForPath(path)) commands.push(step)
        }
        return commands.concat(this.finalSteps)
    }
    getDrawableArea(): Rect {
        return {
            x: 0,
            y: 0,
            width: this.settings.layout.width,
            height: this.settings.layout.height,
        }
    }
    getGCodeForElement(element: Geometry): string[] {
        return this.getGCodeForPath(element.path)
    }
    getGCodeForPath(path: Vector[]): string[] {
        const drawSteps: string[] = []
        const clippedPaths = clipPolyline(path, this.getDrawableArea())

        for (const clippedPath of clippedPaths) {
            // the pen is already on the first point after beforeElementDraw
            drawSteps.push(...this.beforeElementDraw(clippedPath))
            for (const v of clippedPath.slice(1)) {
                drawSteps.push(this.comptudeCoordSteps(v.x, v.y))
            }
            drawSteps.push(...this.afterElementDraw())
        }

        return drawSteps
    }

    comptudeCoordSteps(x: number, y: number): string {
        const { baseCommand, revertAxisX, revertAxisY } = this.settings.gcode
        const coordX = round(revertAxisX ? x * -1 : x)
        const coordY = round(revertAxisY ? y * -1 : y)
        return `${baseCommand} X${coordX} Y${coordY}`
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
