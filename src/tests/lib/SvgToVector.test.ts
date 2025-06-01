import { describe, expect, test } from 'vitest'
import { svgToVector } from '@/lib/SvgToVector'
import {
    SVG_C_COMMAND,
    SVG_M_COMMAND,
    SVG_PARSED_PATH,
    SVG_PARSED_BASIC_PATH,
} from '@/tests/mocks/SvgPath'

describe('Svg to vector array function', () => {
    test('svgToVector should return an array of vectors', () => {
        const vectorsCollection = svgToVector(SVG_PARSED_PATH)
        expect(vectorsCollection).not.toBeUndefined()
        expect(vectorsCollection).toBeInstanceOf(Array)
        expect(vectorsCollection.length).toBe(1)

        const vectors = vectorsCollection[0]
        expect(vectors).toBeInstanceOf(Array)
        expect(vectors.length).toBe(165)
    })

    test('svgToVector should compute basic commands', () => {
        const vectorsCollection = svgToVector(SVG_PARSED_BASIC_PATH)
        const vectors = vectorsCollection[0]
        expect(vectors).toBeInstanceOf(Array)
        expect(vectors.length).toBe(8)
    })

    test('svgToVector should compute C command', () => {
        const vectorsCollection = svgToVector([SVG_M_COMMAND, SVG_C_COMMAND])
        const vectors = vectorsCollection[0]
        expect(vectors).toBeInstanceOf(Array)
        expect(vectors.length).toBe(22)
        expect(vectors[10].x).toBe(833.449)
        expect(vectors[14].x).toBe(824.654)
        expect(vectors[14].y).toBe(329.932)
    })
})
