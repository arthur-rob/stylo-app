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

export const svgToVector = (path: SvgParsedPath[]): Vector[] => {
    const vectors: Vector[] = []

    path.forEach((segment, index, array) => {
        const baseCommand = segment.code.toUpperCase()
        const isRelative = segment.relative
        const vectoToAdd = isRelative
            ? new Vector(array[index - 1].x, array[index - 1].y)
            : new Vector(0, 0)
        switch (baseCommand) {
            case 'M':
            case 'L':
                vectors.push(new Vector(segment.x, segment.y).add(vectoToAdd))
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
        }
    })
    return vectors
}
