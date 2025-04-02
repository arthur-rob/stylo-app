<template>
    <div class="layout-editor flex bg-stone-100 w-full">
        <div class="w-full flex">
            <div class="flex justify-between items-center h-full w-full" >
                <div class="canvas-aligner flex items-center justify-center h-full w-full">
                    <canvas id="stylo" class="p-2 rounded bg-white self-center border-dashed border-4 border-slate-100 outline outline-white  outline-4"></canvas>
                </div>
                <div class="controls-wrapper flex-initial justify-self-end h-screen w-64 p-2 bg-white">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">

interface MenuItem {
    label: string
    href: string
    icon: string
}
interface MenuCat {
    label: string
    items: MenuItem[]
}
</script>
<style scoped lang="scss">
.side-bar{
    height: 100dvh;
    width: 280px;
    border-right: 1px solid #ccc;
}
</style>
