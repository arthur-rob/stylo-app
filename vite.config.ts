import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        extensions: ['.js', '.vue', '.ts', '.css'],
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    plugins: [tailwindcss(), vue()],
    test: {
        globals: true,
        environment: 'jsdom',
    },
})
