import { parseSVG } from 'svg-path-parser'
import Vector from '@/lib/core/Vector'
import { svgToVector } from '@/lib/SvgToVector'

const PX_TO_MM = 25.4 / 96
const UNIT_TO_MM: Record<string, number> = {
    '': PX_TO_MM,
    px: PX_TO_MM,
    mm: 1,
    cm: 10,
    q: 0.25,
    in: 25.4,
    pt: 25.4 / 72,
    pc: 25.4 / 6,
}

// Convert an SVG length ("210mm", "8.5in", "800") to mm, null if relative (%, em…)
export function lengthToMm(value: string | null): number | null {
    if (!value) return null
    const match = value
        .trim()
        .match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*([a-z%]*)$/i)
    if (!match) return null
    const unit = match[2].toLowerCase()
    if (!(unit in UNIT_TO_MM)) return null
    return parseFloat(match[1]) * UNIT_TO_MM[unit]
}

// Scale and origin mapping SVG user units to mm on paper
export function getUserUnitTransform(svg: Element): {
    scale: number
    origin: Vector
} {
    const viewBox = (svg.getAttribute('viewBox') || '')
        .trim()
        .split(/[\s,]+/)
        .map(Number)
    const hasViewBox =
        viewBox.length === 4 &&
        viewBox.every(Number.isFinite) &&
        viewBox[2] > 0 &&
        viewBox[3] > 0
    if (!hasViewBox) return { scale: PX_TO_MM, origin: new Vector(0, 0) }

    const [minX, minY, width, height] = viewBox
    const widthMm = lengthToMm(svg.getAttribute('width'))
    const heightMm = lengthToMm(svg.getAttribute('height'))
    let scale = PX_TO_MM
    if (widthMm) scale = widthMm / width
    else if (heightMm) scale = heightMm / height
    return { scale, origin: new Vector(minX, minY) }
}

// Parse an SVG document into polylines expressed in mm
export function svgToPaths(content: string): Vector[][] {
    const doc = new DOMParser().parseFromString(content, 'image/svg+xml')
    const svg = doc.documentElement
    if (doc.querySelector('parsererror') || svg.nodeName !== 'svg')
        throw new Error('This file is not a valid SVG')

    const { scale, origin } = getUserUnitTransform(svg)
    const paths: Vector[][] = []
    svg.querySelectorAll('path').forEach((element) => {
        const d = element.getAttribute('d')
        if (!d) return
        try {
            svgToVector(parseSVG(d)).forEach((points) => {
                const path = points
                    .filter(Boolean)
                    .map(
                        (v) =>
                            new Vector(
                                (v.x - origin.x) * scale,
                                (v.y - origin.y) * scale
                            )
                    )
                if (path.length > 0) paths.push(path)
            })
        } catch (error) {
            console.warn('Skipping unreadable path', error)
        }
    })
    return paths
}
