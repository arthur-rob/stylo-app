<template>
    <aside
        class="stylo-menu flex flex-col shrink-0 h-screen border-r border-base-300 bg-base-200"
    >
        <div class="flex items-center gap-3 px-4 h-14 border-b border-base-300">
            <img src="/pentagon.svg" width="22" alt="" />
            <p class="font-semibold tracking-tight">Stylo</p>
        </div>
        <nav class="flex-1 p-2 space-y-1" aria-label="Main">
            <RouterLink
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-base-content/70 hover:bg-base-300 hover:text-base-content transition-colors"
            >
                <Icon :name="link.icon" />
                {{ link.label }}
            </RouterLink>
        </nav>
        <div class="p-3 border-t border-base-300">
            <div class="flex items-center gap-1 text-sm">
                <RouterLink
                    to="/plotters"
                    class="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1 -m-1 hover:bg-base-300"
                    title="Manage plotters"
                >
                    <span
                        class="status status-sm"
                        :class="status.class"
                        aria-hidden="true"
                    ></span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs text-base-content/50">Plotter</p>
                        <p class="truncate">{{ status.label }}</p>
                    </div>
                </RouterLink>
                <button
                    v-if="store.connection === 'offline'"
                    class="btn btn-ghost btn-xs btn-square"
                    title="Retry connection"
                    aria-label="Retry plotter connection"
                    @click="store.syncPlotter().catch(() => {})"
                >
                    <Icon name="refresh" :size="14" />
                </button>
            </div>
        </div>
    </aside>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { useIndexStore } from '@/store/index'
import Icon from '@/components/Icon.vue'

const store = useIndexStore()

const links = [
    { to: '/import', label: 'Import', icon: 'upload' },
    { to: '/carto', label: 'Carto', icon: 'map' },
    { to: '/playground', label: 'Playground', icon: 'shapes' },
    { to: '/plotters', label: 'Plotters', icon: 'plotter' },
] as const

const status = computed(() => {
    if (store.connection === 'connecting')
        return { class: 'status-warning', label: 'Connecting…' }
    if (store.connection === 'offline')
        return { class: 'status-error', label: 'Server offline' }
    if (!store.activePlotter)
        return { class: 'status-error', label: 'No plotter found' }
    return { class: 'status-success', label: store.activePlotter.name }
})
</script>
<style lang="scss" scoped>
.stylo-menu {
    width: 184px;
}
.nav-link.is-active {
    background-color: var(--color-base-300);
    color: var(--color-base-content);
    font-weight: 500;
}
</style>
