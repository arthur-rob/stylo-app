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

export interface SvgLayer {
    name: string
    // stroke color found in the SVG, null when missing or too light for paper
    color: string | null
    paths: Vector[][]
}

const parseDocument = (content: string) => {
    const doc = new DOMParser().parseFromString(content, 'image/svg+xml')
    const svg = doc.documentElement
    if (doc.querySelector('parsererror') || svg.nodeName !== 'svg')
        throw new Error('This file is not a valid SVG')
    return svg
}

const pathElements = (element: Element): Element[] =>
    element.nodeName === 'path'
        ? [element]
        : Array.from(element.querySelectorAll('path'))

// Convert path elements into polylines expressed in mm
const toPaths = (
    elements: Element[],
    { scale, origin }: ReturnType<typeof getUserUnitTransform>
): Vector[][] => {
    const paths: Vector[][] = []
    elements.forEach((element) => {
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

// Most used stroke color, ignored when white-ish since it would vanish on paper
const strokeColor = (group: Element, elements: Element[]): string | null => {
    const counts = new Map<string, number>()
    elements.forEach((element) => {
        const stroke =
            element.getAttribute('stroke') || group.getAttribute('stroke')
        if (stroke) counts.set(stroke, (counts.get(stroke) || 0) + 1)
    })
    const [color] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || []
    const hex = color?.trim().toLowerCase()
    const match = hex?.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)
    if (!hex || !match) return null
    const full =
        match[1].length === 3 ? match[1].replace(/./g, '$&$&') : match[1]
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    return luminance > 0.85 ? null : `#${full}`
}

/**
 * Split an SVG into layers, one per top-level group (contour, trail, forest…).
 * Groups strictly identical to a previous one are skipped and reported, since
 * the pen would draw the same lines twice.
 */
export function svgToLayers(content: string): {
    layers: SvgLayer[]
    duplicates: string[]
} {
    const svg = parseDocument(content)
    const transform = getUserUnitTransform(svg)
    const children = Array.from(svg.children)
    const groups = children.filter((child) => child.nodeName === 'g')

    if (groups.length === 0) {
        const paths = toPaths(pathElements(svg), transform)
        return {
            layers: paths.length
                ? [
                      {
                          name: '',
                          color: strokeColor(svg, pathElements(svg)),
                          paths,
                      },
                  ]
                : [],
            duplicates: [],
        }
    }

    const entries = groups.map((group, index) => ({
        group,
        name:
            group.getAttribute('inkscape:label') ||
            group.getAttribute('id') ||
            `Group ${index + 1}`,
        elements: pathElements(group),
    }))
    const loose = children.filter((child) => child.nodeName === 'path')
    if (loose.length)
        entries.push({ group: svg, name: 'Ungrouped', elements: loose })

    const layers: SvgLayer[] = []
    const duplicates: string[] = []
    const seen = new Set<string>()
    const nameCount = new Map<string, number>()
    for (const { group, name, elements } of entries) {
        const signature = elements.map((el) => el.getAttribute('d')).join('\n')
        if (seen.has(signature)) {
            duplicates.push(name)
            continue
        }
        seen.add(signature)
        const paths = toPaths(elements, transform)
        if (paths.length === 0) continue
        const count = (nameCount.get(name) || 0) + 1
        nameCount.set(name, count)
        layers.push({
            name: count > 1 ? `${name} ${count}` : name,
            color: strokeColor(group, elements),
            paths,
        })
    }
    return { layers, duplicates }
}

// Parse an SVG document into polylines expressed in mm
export function svgToPaths(content: string): Vector[][] {
    const svg = parseDocument(content)
    return toPaths(pathElements(svg), getUserUnitTransform(svg))
}
