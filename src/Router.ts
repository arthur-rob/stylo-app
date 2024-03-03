import { createRouter, createWebHashHistory} from "vue-router"
import Index from "@/views/index.vue"

export const routes = [
    { path: '/', component: Index, name: "home" }
]
  
export default createRouter({
    history: createWebHashHistory(),
    routes, 
})