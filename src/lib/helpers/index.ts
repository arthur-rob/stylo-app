import Vector from '@/lib/core/Vector'
import { Rect } from '@/models/lib'

const PRECISION = 1000
// shorter cropped strokes are only a border touch: drawing them would leave a dot
const MIN_CLIPPED_LENGTH = 1e-6
const round = (value: number) => Math.round(value * PRECISION) / PRECISION

interface ClippedSegment {
    start: Vector
    end: Vector
    startClipped: boolean
    endClipped: boolean
}

// Liang–Barsky: clip the segment [a, b] to the rectangle, or null if it lies fully outside
export function clipSegment(
    a: Vector,
    b: Vector,
    rect: Rect
): ClippedSegment | null {
    if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return null
    const dx = b.x - a.x
    const dy = b.y - a.y
    const p = [-dx, dx, -dy, dy]
    const q = [
        a.x - rect.x,
        rect.x + rect.width - a.x,
        a.y - rect.y,
        rect.y + rect.height - a.y,
    ]
    let t0 = 0
    let t1 = 1

    for (let i = 0; i < 4; i++) {
        if (p[i] === 0) {
            if (q[i] < 0) return null
            continue
        }
        const r = q[i] / p[i]
        if (p[i] < 0) {
            if (r > t1) return null
            if (r > t0) t0 = r
        } else {
            if (r < t0) return null
            if (r < t1) t1 = r
        }
    }

    const startClipped = t0 > 0
    const endClipped = t1 < 1
    if (
        (startClipped || endClipped) &&
        (t1 - t0) * Math.hypot(dx, dy) < MIN_CLIPPED_LENGTH
    )
        return null
    return {
        start: startClipped
            ? new Vector(round(a.x + t0 * dx), round(a.y + t0 * dy))
            : a,
        end: endClipped
            ? new Vector(round(a.x + t1 * dx), round(a.y + t1 * dy))
            : b,
        startClipped,
        endClipped,
    }
}

const isFinitePoint = (point: Vector) =>
    Number.isFinite(point.x) && Number.isFinite(point.y)

export function isPointInRect(point: Vector, rect: Rect): boolean {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    )
}

function isPathClosed(path: Vector[]): boolean {
    if (path.length < 3) return false
    const first = path[0]
    const last = path[path.length - 1]
    return first.x === last.x && first.y === last.y
}

// Crop a polyline to the rectangle. Lines are never closed against the border:
// each time the path leaves the area, a new polyline (a new pen stroke) starts.
export function clipPolyline(path: Vector[], rect: Rect): Vector[][] {
    if (path.length === 0) return []
    if (path.length === 1)
        return isPointInRect(path[0], rect) && isFinitePoint(path[0])
            ? [path]
            : []

    const result: Vector[][] = []
    let current: Vector[] | null = null

    for (let i = 0; i < path.length - 1; i++) {
        const segment = clipSegment(path[i], path[i + 1], rect)
        if (!segment) {
            if (current) result.push(current)
            current = null
            continue
        }
        if (current && !segment.startClipped) {
            current.push(segment.end)
        } else {
            if (current) result.push(current)
            current = [segment.start, segment.end]
        }
        if (segment.endClipped) {
            result.push(current)
            current = null
        }
    }
    if (current) result.push(current)

    // A closed shape cut by the border may start and end inside: join both ends
    // so the pen draws it in one stroke instead of two
    if (result.length > 1 && isPathClosed(path)) {
        const first = result[0]
        const last = result[result.length - 1]
        if (
            first[0] === path[0] &&
            last[last.length - 1] === path[path.length - 1]
        ) {
            result[0] = [...last, ...first.slice(1)]
            result.pop()
        }
    }

    return result
}

// True when part of the path would be removed by clipPolyline
export function isPathCropped(path: Vector[], rect: Rect): boolean {
    return path.some((point) => !isPointInRect(point, rect))
}
