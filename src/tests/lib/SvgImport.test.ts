import { describe, expect, test } from 'vitest'
import { lengthToMm, svgToPaths } from '@/lib/SvgImport'
import Layer from '@/lib/Layer'
import Path from '@/lib/geometry/Path'

describe('SVG import', () => {
    test('converts lengths to mm', () => {
        expect(lengthToMm('210mm')).toBe(210)
        expect(lengthToMm('1in')).toBe(25.4)
        expect(lengthToMm('96')).toBeCloseTo(25.4)
        expect(lengthToMm('50%')).toBeNull()
    })

    test('maps viewBox units to mm', () => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="50mm" viewBox="10 10 200 100">
            <path d="M10 10 L210 110" />
        </svg>`
        const [path] = svgToPaths(svg)
        expect(path[0].x).toBeCloseTo(0)
        expect(path[1].x).toBeCloseTo(100)
        expect(path[1].y).toBeCloseTo(50)
    })

    test('rejects files that are not SVG', () => {
        expect(() => svgToPaths('not an svg')).toThrow()
    })
})

describe('Layer transform', () => {
    test('fits a layer inside an area keeping its ratio', () => {
        const layer = new Layer()
        layer.add(
            new Path(
                svgToPaths(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><path d="M0 0 L400 200" /></svg>'
                )[0]
            )
        )
        layer.fitTo({ x: 0, y: 0, width: 200, height: 300 })
        const bounds = layer.getBounds()
        expect(bounds?.width).toBeCloseTo(200)
        expect(bounds?.height).toBeCloseTo(100)
        expect(bounds?.y).toBeCloseTo(100)
    })
})
