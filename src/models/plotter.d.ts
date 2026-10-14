export interface Plotter {
    _id: string
    name: string
    path: string
    baudRate: number
    status: PlotterStatus
    createdAt?: Date
    updatedAt?: Date
}

export type PlotterInput = Pick<Plotter, 'name' | 'path' | 'baudRate'>

export interface SerialPortInfo {
    path: string
    manufacturer?: string
    serialNumber?: string
    vendorId?: string
    productId?: string
}

export type PlotterStatus = 'idle' | 'busy' | 'offline' | 'error'
