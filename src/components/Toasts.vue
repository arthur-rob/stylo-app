<template>
    <div class="toast toast-center toast-bottom z-50 mb-10" aria-live="polite">
        <div
            v-for="toast in toasts"
            :key="toast.id"
            role="alert"
            class="alert alert-soft text-sm py-2 pr-2 shadow-lg max-w-sm"
            :class="alertClass[toast.type]"
        >
            <span class="whitespace-normal">{{ toast.message }}</span>
            <button
                class="btn btn-ghost btn-xs btn-square"
                aria-label="Dismiss"
                @click="dismiss(toast.id)"
            >
                <Icon name="x" :size="14" />
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
const alertClass = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
}
</script>
