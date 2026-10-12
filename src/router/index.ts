import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '@/views/index.vue'
import Carto from '@/views/carto/index.vue'
import ImportSvg from '@/views/import/index.vue'

export const routes = [
    { path: '/', redirect: '/import' },
    { path: '/import', component: ImportSvg, name: 'import' },
    { path: '/carto', component: Carto, name: 'carto' },
    { path: '/playground', component: Index, name: 'playground' },
]

export default createRouter({
    history: createWebHashHistory(),
    linkActiveClass: 'is-active',
    routes,
})
