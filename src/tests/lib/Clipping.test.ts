import { describe, expect, test } from 'vitest'
import Vector from '@/lib/core/Vector'
import { clipPolyline, isPathCropped } from '@/lib/helpers'
import Controls from '@/lib/Controls'

const area = { x: 0, y: 0, width: 100, height: 100 }
const toPairs = (paths: Vector[][]) =>
    paths.map((p) => p.map((v) => [v.x, v.y]))

describe('clipPolyline', () => {
    test('keeps a path fully inside untouched', () => {
        const path = [
            new Vector(10, 10),
            new Vector(50, 50),
            new Vector(90, 10),
        ]
        expect(clipPolyline(path, area)).toEqual([path])
        expect(isPathCropped(path, area)).toBe(false)
    })

    test('drops a path fully outside', () => {
        const path = [new Vector(120, 10), new Vector(150, 50)]
        expect(clipPolyline(path, area)).toEqual([])
    })

    test('crops a line at the border without closing it', () => {
        const path = [new Vector(50, 50), new Vector(150, 50)]
        expect(toPairs(clipPolyline(path, area))).toEqual([
            [
                [50, 50],
                [100, 50],
            ],
        ])
        expect(isPathCropped(path, area)).toBe(true)
    })

    test('splits a path leaving and re-entering into separate strokes', () => {
        const path = [
            new Vector(20, 50),
            new Vector(80, 50),
            new Vector(80, 150),
            new Vector(20, 150),
            new Vector(20, 60),
        ]
        expect(toPairs(clipPolyline(path, area))).toEqual([
            [
                [20, 50],
                [80, 50],
                [80, 100],
            ],
            [
                [20, 100],
                [20, 60],
            ],
        ])
    })

    test('keeps a segment crossing the whole area', () => {
        const path = [new Vector(-50, 50), new Vector(150, 50)]
        expect(toPairs(clipPolyline(path, area))).toEqual([
            [
                [0, 50],
                [100, 50],
            ],
        ])
    })

    test('joins both ends of a cropped closed shape into one stroke', () => {
        const square = [
            new Vector(50, 50),
            new Vector(150, 50),
            new Vector(150, 80),
            new Vector(50, 80),
            new Vector(50, 50),
        ]
        expect(toPairs(clipPolyline(square, area))).toEqual([
            [
                [100, 80],
                [50, 80],
                [50, 50],
                [100, 50],
            ],
        ])
    })
})

describe('Controls G-code clipping', () => {
    test('lifts the pen between cropped parts', () => {
        const { width } = Controls.getDrawableArea()
        const path = [
            new Vector(10, 10),
            new Vector(width + 50, 10),
            new Vector(width + 50, 20),
            new Vector(10, 20),
        ]
        const { zAxisDown, zAxisUp } = Controls.settings.gcode
        const steps = Controls.getGCodeForPath(path)
        expect(steps.filter((s) => s === zAxisDown)).toHaveLength(2)
        expect(steps.filter((s) => s === zAxisUp)).toHaveLength(2)
    })
})
