import { createApp } from 'vue'
import './styles/index.scss'
import App from './App.vue'
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')

export { Stylo }