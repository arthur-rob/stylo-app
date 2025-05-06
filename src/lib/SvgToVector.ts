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
        const isRelative = segment.relative
        const vectoToAdd = isRelative
            ? new Vector(array[index - 1].x, array[index - 1].y)
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
                vectors.push(new Vector(segment.x, 0).add(vectoToAdd))
                break
            case 'V':
                vectors.push(new Vector(0, segment.y).add(vectoToAdd))
                break
            case 'C':
                vectors.push(
                    new Vector(segment.x1, segment.y1).add(vectoToAdd),
                    new Vector(segment.x2, segment.y2).add(vectoToAdd),
                    new Vector(segment.x, segment.y).add(vectoToAdd)
                )
                break
            case 'S':
                vectors.push(
                    new Vector(array[index - 1].x1, array[index - 1].y1).add(
                        vectoToAdd
                    ),
                    new Vector(segment.x2, segment.y2).add(vectoToAdd),
                    new Vector(segment.x, segment.y).add(vectoToAdd)
                )
                break
            case 'Z':
                vectors.push(new Vector(segment.x, segment.y).add(vectoToAdd))
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
