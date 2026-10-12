export interface GeoOptions {
    scale?: number
    color?: string
    lineWidth?: number
}
export interface Box {
    width: number
    height: number
}
export interface Rect extends Box {
    x: number
    y: number
}
export type PaperSize = 'A5' | 'A4'
