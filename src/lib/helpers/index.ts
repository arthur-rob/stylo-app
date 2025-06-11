import Vector from '@/lib/core/Vector'
import ClipperLib from 'clipper-lib'

// Detect whether the input polygon is closed
function isPolygonClosed(polygon: Vector[]): boolean {
    if (polygon.length < 3) return false
    const first = polygon[0]
    const last = polygon[polygon.length - 1]
    return first.x === last.x && first.y === last.y
}

// Convert a Vector[] to Clipper format, forcing closed for Clipper
function toClipperPath(
    polygon: Vector[],
    scale: number
): { X: number; Y: number }[] {
    const path = polygon.map((p) => ({
        X: Math.round(p.x * scale),
        Y: Math.round(p.y * scale),
    }))

    if (path.length >= 2) {
        const first = path[0]
        const last = path[path.length - 1]
        if (first.X !== last.X || first.Y !== last.Y) {
            path.push({ X: first.X, Y: first.Y }) // Close it for Clipper
        }
    }

    return path
}

// Convert Clipper path back to Vector[], optionally keeping it closed
function fromClipperPath(
    path: { X: number; Y: number }[],
    scale: number,
    shouldClose = true
): Vector[] {
    const result = path.map((p) => new Vector(p.X / scale, p.Y / scale))

    if (shouldClose && result.length >= 2) {
        const first = result[0]
        const last = result[result.length - 1]
        if (first.x !== last.x || first.y !== last.y) {
            result.push(new Vector(first.x, first.y))
        }
    }

    return result
}

// Main function to clip a path using Clipper
export function clipPathWithClipper(
    path: Vector[],
    clipPolygon: Vector[]
): Vector[] {
    const scale = 1000
    const isClosed = isPolygonClosed(path)

    const subject = toClipperPath(path, scale)
    const clip = toClipperPath(clipPolygon, scale)

    const clipper = new ClipperLib.Clipper()
    clipper.AddPath(subject, ClipperLib.PolyType.ptSubject, true)
    clipper.AddPath(clip, ClipperLib.PolyType.ptClip, true)

    const solution: ClipperLib.Paths = new ClipperLib.Paths()
    clipper.Execute(
        ClipperLib.ClipType.ctIntersection,
        solution,
        ClipperLib.PolyFillType.pftNonZero,
        ClipperLib.PolyFillType.pftNonZero
    )

    return solution.length > 0
        ? fromClipperPath(solution[0], scale, isClosed)
        : []
}
