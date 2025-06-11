export interface Plotter {
    name: string
    path: string
    baudRate: number
    status: PlotterStatus
    createdAt?: Date
    updatedAt?: Date
}

export type PlotterStatus = 'idle' | 'busy' | 'offline' | 'error'
