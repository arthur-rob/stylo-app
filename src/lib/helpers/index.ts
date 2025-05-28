import Vector from '@/lib/core/Vector'

export const sutherlandHodgmanClip = (
    path: Vector[],
    clipPolygon: Vector[]
): Vector[] => {
    let outputList = path

    for (let i = 0; i < clipPolygon.length; i++) {
        const inputList = outputList
        outputList = []

        const A = clipPolygon[i]
        const B = clipPolygon[(i + 1) % clipPolygon.length]

        for (let j = 0; j < inputList.length - 1; j++) {
            const P = inputList[j]
            const Q = inputList[j + 1]

            const insideP = isInside(P, A, B)
            const insideQ = isInside(Q, A, B)

            if (insideP && insideQ) {
                outputList.push(Q)
            } else if (insideP && !insideQ) {
                outputList.push(intersection(P, Q, A, B))
            } else if (!insideP && insideQ) {
                outputList.push(intersection(P, Q, A, B))
                outputList.push(Q)
            }
            // else both outside: no output
        }
    }

    return outputList
}

// Check if point is on the inside of edge AB (left of AB)
function isInside(p: Vector, a: Vector, b: Vector): boolean {
    const ab = b.subtract(a)
    const ap = p.subtract(a)
    return ab.x * ap.y - ab.y * ap.x >= 0
}

// Compute intersection point of segments PQ and edge AB
function intersection(p: Vector, q: Vector, a: Vector, b: Vector): Vector {
    const r = q.subtract(p)
    const s = b.subtract(a)
    const denominator = r.x * s.y - r.y * s.x

    if (denominator === 0) return p // Parallel lines or overlapping

    const t = ((a.x - p.x) * s.y - (a.y - p.y) * s.x) / denominator
    return new Vector(p.x + t * r.x, p.y + t * r.y)
}
