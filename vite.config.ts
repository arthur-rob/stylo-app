import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        extensions: ['.js', '.vue', '.ts'],
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    plugins: [vue(), tailwindcss()],
})
