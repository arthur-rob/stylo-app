import { describe, expect, test } from 'vitest'
import { lengthToMm, svgToLayers, svgToPaths } from '@/lib/SvgImport'
import Layer, { fitLayersTo } from '@/lib/Layer'
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

const svg = (body: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100mm" height="100mm">${body}</svg>`

describe('SVG groups to layers', () => {
    const map = svg(`
        <g id="trail"><path d="M0 0 L10 10" stroke="#e65100" /><path d="M5 5 L20 20" stroke="#e65100" /></g>
        <g id="road"><path d="M0 50 L100 50" stroke="#ffffff" /></g>
        <g id="road"><path d="M0 50 L100 50" stroke="#ffffff" /></g>
        <g id="contour"><path d="M0 60 L100 60" stroke="#fff" /></g>
        <g id="contour"><path d="M0 70 L100 70" stroke="#795548" /></g>
        <g id="empty"></g>
        <path d="M1 1 L2 2" />
    `)

    test('creates one layer per top-level group', () => {
        const { layers } = svgToLayers(map)
        expect(layers.map((layer) => layer.name)).toEqual([
            'trail',
            'road',
            'contour',
            'contour 2',
            'Ungrouped',
        ])
        expect(layers[0].paths).toHaveLength(2)
    })

    test('skips groups identical to a previous one', () => {
        expect(svgToLayers(map).duplicates).toEqual(['road'])
    })

    test('keeps stroke colors except white-ish ones', () => {
        const colors = svgToLayers(map).layers.map((layer) => layer.color)
        expect(colors).toEqual(['#e65100', null, null, '#795548', null])
    })

    test('uses the whole file as one layer without groups', () => {
        const { layers } = svgToLayers(svg('<path d="M0 0 L10 10" />'))
        expect(layers).toHaveLength(1)
        expect(layers[0].name).toBe('')
    })
})

describe('fitLayersTo', () => {
    test('gives layers of a drawing the same transform', () => {
        const [big, small] = ['M0 0 L400 200', 'M100 50 L200 100'].map((d) => {
            const layer = new Layer()
            layer.add(new Path(svgToPaths(svg(`<path d="${d}" />`))[0]))
            return layer
        })
        fitLayersTo([big, small], { x: 0, y: 0, width: 200, height: 300 })
        expect(small.scaleFactor).toBe(big.scaleFactor)
        expect(small.offset).toEqual(big.offset)
        expect(big.getBounds()?.width).toBeCloseTo(200)
    })
})
