<template>
    <div class="w-full flex">
        <div class="flex justify-between items-center h-full w-full">
            <div
                class="canvas-aligner flex items-center justify-center h-full w-full"
            >
                <canvas
                    id="stylo"
                    class="p-2 rounded bg-white self-center outline outline-white outline-4"
                ></canvas>
            </div>
            <div class="spacer w-px border-r border-gray-400 h-full"></div>
            <div
                class="controls-wrapper flex-initial justify-self-end h-screen w-64 p-2 bg-gray-800"
            >
                <slot></slot>
            </div>
        </div>
    </div>
</template>
