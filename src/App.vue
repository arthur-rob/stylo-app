<template class="bg-slate-200">
    <Menu />
    <Layout>
        <router-view></router-view>
    </Layout>
    <ActionBars />
</template>
<script lang="ts" setup>
import '@/index.css'    
import { useIndexStore } from '@/store/index'
import Menu from '@/components/menu.vue'
import ActionBars from '@/components/actions.vue'
import Layout from '@/views/layout.vue'
const indexStore = useIndexStore()
indexStore.syncPlotter()
</script>
