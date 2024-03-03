<template>
    <div class="layout-editor flex bg-stone-100 w-full">
        <div class="h-screen p-2 bg-white w-64 mr-2 flex-initial">
            <div class="menu-item" v-for="cat in menuItems" :key="cat.label">
                <h2 class="font-bold ">{{ cat.label }}</h2>
                <a :href="item.href" v-for="item in cat.items"> 
                    <div class="menu-item rounded p-2 my-2 hover:bg-slate-100 cursor-pointer" >
                        {{ item.label }}
                    </div>
                </a>
            </div>
        </div>
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
import { ref } from "vue"
interface MenuItem {
    label: string
    href: string
    icon: string
}
interface MenuCat {
    label: string
    items: MenuItem[]
}
const menuItems = ref<MenuCat[]>([{
    label: 'Index',
    items: [
        {
            label: "Home",
            href: "/",
            icon: "pi-home"
        }
    ]
}])
</script>
<style scoped lang="scss">
.side-bar{
    height: 100dvh;
    width: 280px;
    border-right: 1px solid #ccc;
}
</style>
