<template>
    <dialog ref="dialog" class="modal" @close="error = ''">
        <form class="modal-box max-w-md" novalidate @submit.prevent="submit">
            <h3 class="text-lg font-semibold">
                {{ editing ? `Edit ${editing.name}` : 'Add a plotter' }}
            </h3>
            <p class="mt-1 text-sm text-base-content/60">
                Stylo talks to the plotter through the server's serial port.
            </p>

            <fieldset class="fieldset mt-4">
                <label class="fieldset-legend" for="plotter-name">Name</label>
                <input
                    id="plotter-name"
                    v-model="form.name"
                    class="input w-full"
                    :class="{ 'input-error': submitted && nameError }"
                    autocomplete="off"
                    required
                />
                <p
                    class="label text-xs"
                    :class="{ 'text-error': submitted && nameError }"
                >
                    {{
                        (submitted && nameError) ||
                        'Unique, used to send drawings to this plotter'
                    }}
                </p>

                <label class="fieldset-legend" for="plotter-path">
                    Serial port
                </label>
                <input
                    id="plotter-path"
                    v-model="form.path"
                    class="input w-full font-mono text-sm"
                    :class="{ 'input-error': submitted && pathError }"
                    list="plotter-ports"
                    autocomplete="off"
                    spellcheck="false"
                    required
                />
                <datalist id="plotter-ports">
                    <option
                        v-for="port in store.ports || []"
                        :key="port.path"
                        :value="port.path"
                    >
                        {{ port.manufacturer }}
                    </option>
                </datalist>
                <p
                    v-if="submitted && pathError"
                    class="label text-xs text-error"
                >
                    {{ pathError }}
                </p>
                <div class="mt-1 flex flex-wrap items-center gap-1">
                    <span class="text-xs text-base-content/50">Detected:</span>
                    <template v-if="store.ports?.length">
                        <button
                            v-for="port in store.ports"
                            :key="port.path"
                            type="button"
                            class="btn btn-xs font-mono font-normal"
                            :class="
                                form.path === port.path
                                    ? 'btn-primary'
                                    : 'btn-ghost bg-base-200'
                            "
                            :title="port.manufacturer || port.path"
                            @click="form.path = port.path"
                        >
                            {{ port.path.replace('/dev/', '') }}
                        </button>
                    </template>
                    <span v-else class="text-xs text-base-content/50">
                        {{ store.ports ? 'no serial port' : 'unavailable' }}
                    </span>
                    <button
                        type="button"
                        class="btn btn-ghost btn-xs btn-square"
                        title="Scan serial ports again"
                        aria-label="Scan serial ports again"
                        @click="scanPorts"
                    >
                        <span
                            v-if="scanning"
                            class="loading loading-spinner loading-xs"
                        ></span>
                        <Icon v-else name="refresh" :size="12" />
                    </button>
                </div>

                <label class="fieldset-legend" for="plotter-baud">
                    Baud rate
                </label>
                <select
                    id="plotter-baud"
                    v-model.number="form.baudRate"
                    class="select w-full"
                >
                    <option v-for="rate in baudRates" :key="rate" :value="rate">
                        {{ rate.toLocaleString() }}
                    </option>
                </select>
            </fieldset>

            <div
                v-if="error"
                role="alert"
                class="alert alert-error alert-soft mt-4 py-2 text-sm"
            >
                {{ error }}
            </div>

            <div class="modal-action">
                <button type="button" class="btn btn-ghost" @click="close">
                    Cancel
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="saving"
                >
                    <span
                        v-if="saving"
                        class="loading loading-spinner loading-sm"
                    ></span>
                    {{ editing ? 'Save changes' : 'Add plotter' }}
                </button>
            </div>
        </form>
        <form method="dialog" class="modal-backdrop">
            <button aria-label="Close">close</button>
        </form>
    </dialog>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import { apiErrorMessage, useIndexStore } from '@/store/index'
import { BAUD_RATES, DEFAULT_PLOTTER } from '@/constants/plotter'
import { Plotter, PlotterInput } from '@/models/plotter'

const emit = defineEmits<{ saved: [name: string] }>()
const store = useIndexStore()

const dialog = ref<HTMLDialogElement>()
const editing = ref<Plotter | null>(null)
const form = reactive<PlotterInput>({ ...DEFAULT_PLOTTER })
const submitted = ref(false)
const saving = ref(false)
const scanning = ref(false)
const error = ref('')

const baudRates = computed(() =>
    BAUD_RATES.includes(form.baudRate)
        ? BAUD_RATES
        : [...BAUD_RATES, form.baudRate].sort((a, b) => a - b)
)
const nameError = computed(() => {
    const name = form.name.trim()
    if (!name) return 'Give the plotter a name'
    const taken = store.plotters.some(
        (plotter) => plotter.name === name && plotter._id !== editing.value?._id
    )
    return taken ? `"${name}" is already used by another plotter` : ''
})
const pathError = computed(() =>
    form.path.trim() ? '' : 'Choose the serial port the plotter is plugged in'
)

// stylo01, then stylo02… so a new plotter never starts with a taken name
const nextFreeName = () => {
    const names = new Set(store.plotters.map((plotter) => plotter.name))
    if (!names.has(DEFAULT_PLOTTER.name)) return DEFAULT_PLOTTER.name
    for (let i = 2; ; i++) {
        const name = `stylo${String(i).padStart(2, '0')}`
        if (!names.has(name)) return name
    }
}

const scanPorts = async () => {
    scanning.value = true
    try {
        await store.discoverPorts()
    } catch {
        // shown as "unavailable" next to the field
    } finally {
        scanning.value = false
    }
}

const open = (plotter: Plotter | null = null) => {
    editing.value = plotter
    Object.assign(
        form,
        plotter
            ? {
                  name: plotter.name,
                  path: plotter.path,
                  baudRate: plotter.baudRate,
              }
            : { ...DEFAULT_PLOTTER, name: nextFreeName() }
    )
    submitted.value = false
    error.value = ''
    dialog.value?.showModal()
    scanPorts()
}
const close = () => dialog.value?.close()

const submit = async () => {
    submitted.value = true
    if (nameError.value || pathError.value) return
    const input: PlotterInput = {
        name: form.name.trim(),
        path: form.path.trim(),
        baudRate: form.baudRate,
    }
    saving.value = true
    error.value = ''
    try {
        if (editing.value) await store.updatePlotter(editing.value._id, input)
        else await store.registerPlotter(input)
        emit('saved', input.name)
        close()
    } catch (saveError) {
        error.value = apiErrorMessage(
            saveError,
            'Could not reach the Stylo server'
        )
    } finally {
        saving.value = false
    }
}

defineExpose({ open })
</script>
