import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '@/views/index.vue'
import Carto from '@/views/carto/index.vue'
import ImportSvg from '@/views/import/index.vue'

export const routes = [
    { path: '/', component: Index, name: 'home' },
    { path: '/carto', component: Carto, name: 'carto' },
    { path: '/import', component: ImportSvg, name: 'import' },
]

export default createRouter({
    history: createWebHashHistory(),
    linkActiveClass: 'bg-gray-600 text-white',
    routes,
})
