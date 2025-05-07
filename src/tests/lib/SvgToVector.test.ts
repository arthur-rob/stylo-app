import { describe, expect, test } from 'vitest'
import { svgToVector } from '@/lib/SvgToVector'
import { SVG_PARSED_PATH, SVG_PARSED_BASIC_PATH } from '@/tests/mocks/SvgPath'
describe('Svg to vector array function', () => {
    test('svgToVector should return an array of vectors', () => {
        const vectorsCollection = svgToVector(SVG_PARSED_PATH)
        expect(vectorsCollection).not.toBeUndefined()
        expect(vectorsCollection).toBeInstanceOf(Array)
        expect(vectorsCollection.length).toBe(1)

        const vectors = vectorsCollection[0]
        expect(vectors).toBeInstanceOf(Array)
        expect(vectors.length).toBe(39)
    })

    test('svgToVector should compute basic commands', () => {
        const vectorsCollection = svgToVector(SVG_PARSED_BASIC_PATH)
        const vectors = vectorsCollection[0]
        expect(vectors).toBeInstanceOf(Array)
        expect(vectors.length).toBe(8)
    })

    test('svgToVector should compute curves commands', () => {
        const vectorsCollection = svgToVector(SVG_PARSED_PATH)
        const vectors = vectorsCollection[0]
        expect(vectors).toBeInstanceOf(Array)
        expect(vectors.length).toBe(39)
        expect(vectors[0].x).toBe(881.4)
        expect(vectors[14].x).toBe(789.4)
        expect(vectors[14].y).toBe(131.8)
    })
})
