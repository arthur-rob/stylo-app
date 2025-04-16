<template class="bg-slate-200">
    <Layout>
        <router-view></router-view>
    </Layout>
</template>
<script lang="ts" setup>
import '@/index.css'
import { useIndexStore } from '@/store/index'
import Layout from '@/views/layout.vue'
const indexStore = useIndexStore()
indexStore.syncPlotter()
</script>
