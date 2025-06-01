import Vector from '@/lib/core/Vector'
export interface SvgCommand {
    code: string
    x?: number
    y?: number
    command?: string
    x1?: number
    y1?: number
    x2?: number
    y2?: number
    relative?: boolean
}

export const svgToVector = (path: SvgCommand[]): Vector[][] => {
    const vectors: Vector[] = []
    const vectorsCollection: Vector[][] = []
    path.forEach((segment, index, array) => {
        const baseCommand = segment.code.toUpperCase()
        const isRelative = !!segment.relative
        const lastSegment = vectors.slice(-1).pop()
        const vectoToAdd = isRelative
            ? lastSegment || new Vector(0, 0)
            : new Vector(0, 0)
        switch (baseCommand) {
            case 'M':
                if (index > 0) {
                    vectorsCollection.push([...vectors])
                    vectors.length = 0
                }
                vectors.push(new Vector(segment.x, segment.y).add(vectoToAdd))
                break
            case 'L':
                vectors.push(new Vector(segment.x, segment.y).add(vectoToAdd))
                break
            case 'H':
                if (!isRelative) vectoToAdd.y = lastSegment?.y || 0
                vectors.push(new Vector(segment.x, 0).add(vectoToAdd))
                break
            case 'V':
                if (!isRelative) vectoToAdd.x = lastSegment?.x || 0
                vectors.push(new Vector(0, segment.y).add(vectoToAdd))
                break
            case 'C': {
                const controlPoint1 = new Vector(
                    segment.x1 || 0,
                    segment.y1 || 0
                ).add(vectoToAdd)
                const controlPoint2 = new Vector(
                    segment.x2 || 0,
                    segment.y2 || 0
                ).add(vectoToAdd)
                const endPoint = new Vector(segment.x, segment.y).add(
                    vectoToAdd
                )
                const bezierCurveVectors = computeQuadraticBezierPoints(
                    controlPoint1,
                    controlPoint2,
                    endPoint,
                    20
                )
                vectors.push(...bezierCurveVectors)
                break
            }
            case 'S':
                vectors.push(
                    lastSegment,
                    new Vector(segment.x2 || 0, segment.y2 || 0).add(
                        vectoToAdd
                    ),
                    new Vector(segment.x, segment.y).add(vectoToAdd)
                )
                break
            case 'Z':
                vectors.push(new Vector(vectors[0].x, vectors[0].y))
                break
            default:
                console.warn(
                    `Unsupported SVG command: ${segment.code} at index ${index}`
                )
                break
        }

        if (index === array.length - 1) vectorsCollection.push(vectors)
    })
    return vectorsCollection
}

export function computeQuadraticBezierPoints(
    p0: Vector,
    p1: Vector,
    p2: Vector,
    numPoints: number
): Vector[] {
    const points: Vector[] = []

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const oneMinusT = 1 - t

        const term1 = p0.scale(oneMinusT * oneMinusT)
        const term2 = p1.scale(2 * oneMinusT * t)
        const term3 = p2.scale(t * t)

        const point = term1.add(term2).add(term3)
        points.push(point)
    }

    return points
}
