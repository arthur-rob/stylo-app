export interface Coordinate {
    x: number
    y: number
    isGap?: boolean
}
export interface GeoOptions {
    scale?: number
    color?: string
}
export interface Box {
    width: number
    height: number
}
export type PaperSize = 'A5' | 'A4'
