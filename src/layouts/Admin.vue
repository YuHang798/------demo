<template>
    <el-container>
        <el-header>
            <FHeader />
        </el-header>
        <el-container>
            <el-aside :width="adminStore.menuAsideWidth" class="transition-all">
                <FMenu />
            </el-aside>
            <el-main>
                <FTagList />
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <keep-alive :max="10">
                            <component :is="Component" />
                        </keep-alive>
                    </transition>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
// import { transition } from '@vueuse/core';
import FHeader from './components/FHeader.vue';
import FMenu from './components/FMenu.vue';
import FTagList from './components/FTagList.vue';
import { useAdminStore } from '@/store/useAdmin.ts';

const adminStore = useAdminStore()


</script>

<style scoped>
.fade-enter-from {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
}


.fade-enter-to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
}


.fade-leave-from {
    opacity: 1;
}

.fade-leave-to {
    opacity: 0;
    -webkit-transform: translate3d(0, 100%, 0);
    transform: translate3d(0, 100%, 0);
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}
</style>
