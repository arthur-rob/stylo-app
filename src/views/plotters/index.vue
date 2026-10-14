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

            <section v-else aria-labelledby="saved-plotters">
                <div class="mb-3 flex items-center justify-between gap-2">
                    <h2
                        id="saved-plotters"
                        class="flex items-center gap-2 text-sm font-semibold"
                    >
                        Saved plotters
                        <span
                            v-if="loaded"
                            class="badge badge-sm badge-ghost font-normal"
                            >{{ store.plotters.length }}</span
                        >
                    </h2>
                    <button
                        class="btn btn-ghost btn-sm"
                        title="Reload the list from the server (GET /plotter/list)"
                        :disabled="refreshing"
                        @click="reloadList"
                    >
                        <span
                            v-if="refreshing"
                            class="loading loading-spinner loading-xs"
                        ></span>
                        <Icon v-else name="refresh" :size="14" />
                        Refresh
                    </button>
                </div>
                <div v-if="!loaded" class="flex justify-center py-16">
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
                    <button
                        class="btn btn-primary btn-sm"
                        @click="dialog?.open()"
                    >
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
            </section>

            <section
                v-if="store.connection !== 'offline'"
                class="mt-10"
                aria-labelledby="detected-devices"
            >
                <div class="mb-3 flex items-center justify-between gap-2">
                    <div>
                        <h2
                            id="detected-devices"
                            class="flex items-center gap-2 text-sm font-semibold"
                        >
                            Detected devices
                            <span
                                v-if="store.ports"
                                class="badge badge-sm badge-ghost font-normal"
                                >{{ store.ports.length }}</span
                            >
                        </h2>
                        <p class="text-xs text-base-content/50">
                            Serial ports seen by the server<template
                                v-if="scannedAt"
                            >
                                · scanned at {{ scannedAt }}</template
                            >
                        </p>
                    </div>
                    <button
                        class="btn btn-ghost btn-sm"
                        title="Look for plugged devices (GET /plotter/discover)"
                        :disabled="scanning"
                        @click="scan()"
                    >
                        <span
                            v-if="scanning"
                            class="loading loading-spinner loading-xs"
                        ></span>
                        <Icon v-else name="refresh" :size="14" />
                        Scan
                    </button>
                </div>

                <p
                    v-if="loaded && !store.ports"
                    class="rounded-xl border border-base-300 p-4 text-sm text-base-content/60"
                >
                    The server could not list its serial ports. Scan again in a
                    moment.
                </p>
                <p
                    v-else-if="store.ports?.length === 0"
                    class="rounded-xl border border-dashed border-base-300 p-4 text-sm text-base-content/60"
                >
                    No device detected. Plug the plotter in with its USB cable,
                    then scan again.
                </p>
                <ul
                    v-else-if="store.ports"
                    class="divide-y divide-base-300 rounded-xl border border-base-300"
                    aria-label="Detected devices"
                >
                    <li
                        v-for="port in store.ports"
                        :key="port.path"
                        class="flex items-center gap-3 px-4 py-3"
                    >
                        <Icon
                            name="plug"
                            :size="16"
                            class="text-base-content/50"
                        />
                        <div class="min-w-0 flex-1">
                            <p class="truncate font-mono text-sm">
                                {{ port.path }}
                            </p>
                            <p
                                v-if="portDetails(port)"
                                class="truncate text-xs text-base-content/50"
                            >
                                {{ portDetails(port) }}
                            </p>
                        </div>
                        <span
                            v-if="plottersOn(port).length"
                            class="badge badge-sm badge-soft badge-success"
                            :title="`Used by ${plottersOn(port).join(', ')}`"
                        >
                            {{ plottersOn(port).join(', ') }}
                        </span>
                        <button
                            v-else
                            class="btn btn-sm btn-soft"
                            :aria-label="`Add a plotter on ${port.path}`"
                            @click="dialog?.open(null, { path: port.path })"
                        >
                            <Icon name="plus" :size="14" />
                            Add
                        </button>
                    </li>
                </ul>
            </section>
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
import { Plotter, SerialPortInfo } from '@/models/plotter'

const store = useIndexStore()
const { notify } = useToast()

const dialog = ref<InstanceType<typeof PlotterDialog>>()
const confirmDialog = ref<HTMLDialogElement>()
const toDelete = ref<Plotter | null>(null)
const deleting = ref(false)
const loaded = ref(false)
const refreshing = ref(false)
const scanning = ref(false)
const scannedAt = ref('')

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

const portDetails = (port: SerialPortInfo) =>
    [
        port.manufacturer,
        port.serialNumber && `S/N ${port.serialNumber}`,
        port.vendorId && `${port.vendorId}:${port.productId ?? ''}`,
    ]
        .filter(Boolean)
        .join(' · ')
const plottersOn = (port: SerialPortInfo) =>
    store.plotters
        .filter((plotter) => plotter.path === port.path)
        .map((plotter) => plotter.name)

const reloadList = async () => {
    refreshing.value = true
    try {
        await store.syncPlotter()
    } catch {
        // the offline state is shown in the page
    } finally {
        refreshing.value = false
    }
}
const scan = async (reportError = true) => {
    scanning.value = true
    try {
        await store.discoverPorts()
        scannedAt.value = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    } catch {
        if (reportError) notify('Could not scan the serial ports', 'error')
    } finally {
        scanning.value = false
    }
}
const refresh = async () => {
    await Promise.all([reloadList(), scan(false)])
    loaded.value = true
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
