import { ref } from 'vue'

export type ToastType = 'info' | 'success' | 'warning' | 'error'
interface Toast {
    id: number
    type: ToastType
    message: string
}

const toasts = ref<Toast[]>([])
let nextId = 0

const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

const notify = (message: string, type: ToastType = 'info', duration = 4000) => {
    const id = nextId++
    toasts.value.push({ id, type, message })
    if (duration > 0) setTimeout(() => dismiss(id), duration)
}

export function useToast() {
    return { toasts, notify, dismiss }
}
