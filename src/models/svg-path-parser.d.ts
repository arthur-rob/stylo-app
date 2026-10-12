declare module 'svg-path-parser' {
    import { SvgCommand } from '@/lib/SvgToVector'
    export function parseSVG(d: string): SvgCommand[]
}
