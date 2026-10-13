<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        class="shrink-0"
    >
        <path v-for="(d, index) in icons[name]" :key="index" :d="d" />
    </svg>
</template>
<script setup lang="ts">
const circle = (cx: number, cy: number, r: number) =>
    `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`
const eye = 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z'

const icons = {
    upload: [
        'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
        'm17 8-5-5-5 5',
        'M12 3v12',
    ],
    plus: ['M5 12h14', 'M12 5v14'],
    eye: [eye, circle(12, 12, 3)],
    eyeOff: [eye, circle(12, 12, 3), 'M3 3l18 18'],
    trash: [
        'M3 6h18',
        'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
        'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    ],
    layers: ['m12 2 10 5-10 5L2 7z', 'm2 17 10 5 10-5', 'm2 12 10 5 10-5'],
    map: ['M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z', 'M9 3v15', 'M15 6v15'],
    shapes: [circle(7.5, 7.5, 4.5), 'M13 13h8v8h-8z'],
    pen: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'],
    play: ['m6 3 14 9-14 9z'],
    fit: [
        'M8 3H5a2 2 0 0 0-2 2v3',
        'M21 8V5a2 2 0 0 0-2-2h-3',
        'M3 16v3a2 2 0 0 0 2 2h3',
        'M16 21h3a2 2 0 0 0 2-2v-3',
    ],
    reset: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5'],
    refresh: ['M21 12a9 9 0 1 1-3-6.7L21 8', 'M21 3v5h-5'],
    copy: [
        'M11 9h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z',
        'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
    ],
    download: [
        'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
        'm7 10 5 5 5-5',
        'M12 15V3',
    ],
    alert: [
        'm21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z',
        'M12 9v4',
        'M12 17h.01',
    ],
    chevronUp: ['m18 15-6-6-6 6'],
    chevronDown: ['m6 9 6 6 6-6'],
    chevronLeft: ['m15 18-6-6 6-6'],
    chevronRight: ['m9 18 6-6-6-6'],
    x: ['M18 6 6 18', 'm6 6 12 12'],
    check: ['M20 6 9 17l-5-5'],
    arrowUp: ['M12 19V5', 'm5 12 7-7 7 7'],
    arrowDown: ['M12 5v14', 'm19 12-7 7-7-7'],
    plotter: [
        'M6 9V2h12v7',
        'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2',
        'M6 14h12v8H6z',
    ],
    plug: [
        'M12 22v-5',
        'M9 8V2',
        'M15 8V2',
        'M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z',
    ],
}

withDefaults(defineProps<{ name: keyof typeof icons; size?: number }>(), {
    size: 16,
})
</script>
