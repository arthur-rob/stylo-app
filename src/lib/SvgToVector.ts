import Vector from '@/lib/core/Vector'
interface SvgParsedPath {
    code: string
    x: number
    y: number
    x1?: number
    y1?: number
    x2?: number
    y2?: number
    relative: boolean
}

export const svgToVector = (path: SvgParsedPath[]): Vector[][] => {
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
            case 'C':
                vectors.push(
                    new Vector(segment.x1 || 0, segment.y1 || 0).add(
                        vectoToAdd
                    ),
                    new Vector(segment.x2 || 0, segment.y2 || 0).add(
                        vectoToAdd
                    ),
                    new Vector(segment.x, segment.y).add(vectoToAdd)
                )
                break
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
