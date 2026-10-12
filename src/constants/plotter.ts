import { PlotterInput } from '@/models/plotter'

export const DEFAULT_PLOTTER: PlotterInput = {
    name: 'stylo01',
    path: '/dev/tty.usbserial-1120',
    baudRate: 115200,
}

export const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 250000]
