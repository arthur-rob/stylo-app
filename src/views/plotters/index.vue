<template>
    <div class="flex-1 min-w-0 h-screen overflow-y-auto">
        <div class="mx-auto max-w-3xl p-8">
            <header class="mb-6 flex items-end justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">
                        Plotters
                    </h1>
                    <p class="text-sm text-base-content/60">
                        Machines Stylo can send drawings to. The active one is
                        used for plotting and manual controls.
                    </p>
                </div>
                <button
                    class="btn btn-primary"
                    :disabled="store.connection !== 'online'"
                    @click="dialog?.open()"
                >
                    <Icon name="plus" />
                    Add plotter
                </button>
            </header>

            <div
                v-if="store.connection === 'offline'"
                role="alert"
                class="alert alert-error alert-soft"
            >
                <Icon name="alert" />
                <div>
                    <p class="font-medium">Can't reach the Stylo server</p>
                    <p class="text-sm opacity-80">
                        Start stylo-server on localhost:3000, then retry.
                    </p>
                </div>
                <button class="btn btn-sm" @click="refresh">Retry</button>
            </div>

            <div
                v-else-if="store.connection === 'connecting' && !loaded"
                class="flex justify-center py-16"
            >
                <span class="loading loading-spinner"></span>
            </div>

            <div
                v-else-if="store.plotters.length === 0"
                class="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-base-300 px-8 py-14 text-center"
            >
                <Icon name="plotter" :size="32" class="text-primary" />
                <div>
                    <p class="font-medium">No plotter yet</p>
                    <p class="text-sm text-base-content/60">
                        Plug your plotter in, then add it to start plotting.
                    </p>
                </div>
                <button class="btn btn-primary btn-sm" @click="dialog?.open()">
                    Add your first plotter
                </button>
            </div>

            <ul v-else class="space-y-2" aria-label="Plotters">
                <li
                    v-for="plotter in store.plotters"
                    :key="plotter._id"
                    class="flex items-center gap-4 rounded-xl border bg-base-200 p-4"
                    :class="
                        isActive(plotter)
                            ? 'border-primary/60'
                            : 'border-base-300'
                    "
                >
                    <div
                        class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-base-300"
                    >
                        <Icon name="plotter" :size="20" />
                    </div>
                    <div class="min-w-0 flex-1">
                        <p class="flex items-center gap-2 font-medium">
                            <span class="truncate">{{ plotter.name }}</span>
                            <span
                                v-if="isActive(plotter)"
                                class="badge badge-sm badge-primary badge-soft"
                                >Active</span
                            >
                        </p>
                        <p
                            class="flex flex-wrap items-center gap-x-3 text-sm text-base-content/60"
                        >
                            <span class="font-mono truncate">{{
                                plotter.path
                            }}</span>
                            <span
                                >{{
                                    plotter.baudRate.toLocaleString()
                                }}
                                baud</span
                            >
                        </p>
                    </div>
                    <span
                        class="flex items-center gap-1.5 text-xs whitespace-nowrap"
                        :class="portState(plotter).class"
                        :title="portState(plotter).title"
                    >
                        <span
                            class="status"
                            :class="portState(plotter).status"
                        ></span>
                        {{ portState(plotter).label }}
                    </span>
                    <div class="flex items-center gap-1">
                        <button
                            v-if="!isActive(plotter)"
                            class="btn btn-sm btn-soft"
                            @click="activate(plotter)"
                        >
                            Use
                        </button>
                        <button
                            class="btn btn-ghost btn-sm btn-square"
                            :aria-label="`Edit ${plotter.name}`"
                            title="Edit"
                            @click="dialog?.open(plotter)"
                        >
                            <Icon name="pen" />
                        </button>
                        <button
                            class="btn btn-ghost btn-sm btn-square hover:text-error"
                            :aria-label="`Delete ${plotter.name}`"
                            title="Delete"
                            @click="askDelete(plotter)"
                        >
                            <Icon name="trash" />
                        </button>
                    </div>
                </li>
            </ul>
        </div>

        <PlotterDialog
            ref="dialog"
            @saved="(name) => notify(`${name} saved`, 'success')"
        />

        <dialog ref="confirmDialog" class="modal">
            <div class="modal-box max-w-sm">
                <h3 class="text-lg font-semibold">
                    Delete {{ toDelete?.name }}?
                </h3>
                <p class="mt-2 text-sm text-base-content/70">
                    It will be removed from Stylo. Nothing changes on the
                    machine, you can add it again later.
                </p>
                <div class="modal-action">
                    <button
                        class="btn btn-ghost"
                        @click="confirmDialog?.close()"
                    >
                        Cancel
                    </button>
                    <button
                        class="btn btn-error"
                        :disabled="deleting"
                        @click="confirmDelete"
                    >
                        <span
                            v-if="deleting"
                            class="loading loading-spinner loading-sm"
                        ></span>
                        Delete
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button aria-label="Close">close</button>
            </form>
        </dialog>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import PlotterDialog from '@/components/PlotterDialog.vue'
import { apiErrorMessage, useIndexStore } from '@/store/index'
import { useToast } from '@/composables/useToast'
import { Plotter } from '@/models/plotter'

const store = useIndexStore()
const { notify } = useToast()

const dialog = ref<InstanceType<typeof PlotterDialog>>()
const confirmDialog = ref<HTMLDialogElement>()
const toDelete = ref<Plotter | null>(null)
const deleting = ref(false)
const loaded = ref(false)

const isActive = (plotter: Plotter) => store.activePlotter?._id === plotter._id

const portState = (plotter: Plotter) => {
    if (!store.ports)
        return {
            label: 'Unknown',
            status: 'status-neutral',
            class: 'text-base-content/50',
            title: 'Serial ports could not be scanned',
        }
    const found = store.ports.some((port) => port.path === plotter.path)
    return found
        ? {
              label: 'Plugged in',
              status: 'status-success',
              class: 'text-success',
              title: 'The serial port is detected by the server',
          }
        : {
              label: 'Not detected',
              status: 'status-warning',
              class: 'text-warning',
              title: 'No device on this serial port: check the cable or the path',
          }
}

const refresh = async () => {
    try {
        await Promise.all([store.syncPlotter(), store.discoverPorts()])
    } catch {
        // connection state is shown in the page
    } finally {
        loaded.value = true
    }
}

const activate = (plotter: Plotter) => {
    store.setActivePlotter(plotter)
    notify(`Plotting with ${plotter.name}`, 'success', 2000)
}

const askDelete = (plotter: Plotter) => {
    toDelete.value = plotter
    confirmDialog.value?.showModal()
}
const confirmDelete = async () => {
    if (!toDelete.value) return
    deleting.value = true
    try {
        await store.deletePlotter(toDelete.value._id)
        notify(`${toDelete.value.name} deleted`, 'success')
        confirmDialog.value?.close()
    } catch (error) {
        notify(apiErrorMessage(error, 'Could not delete the plotter'), 'error')
    } finally {
        deleting.value = false
    }
}

onMounted(refresh)
</script>
