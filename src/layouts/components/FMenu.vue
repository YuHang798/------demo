<template>
    <div class=" f-menu fixed top-16 left-0 bottom-0 shadow-md overflow-y-auto overflow-x-hidden transition-all"
        :style='{ width: adminStore.menuAsideWidth }'>
        <el-menu :default-active="defaultActive" style="border: 0;" @select="handleSelect" :collapse="isCollapse"
            :collapse-transition=false unique-opened>
            <el-sub-menu index="/maps/tileLayer">
                <template #title>
                    <el-icon>
                        <MapLocation />
                    </el-icon>
                    <span>地图系列</span>
                </template>
                <el-menu-item index="/maps/tileLayer">
                    <el-icon>
                        <MapLocation />
                    </el-icon>
                    <span>TileLayer</span>
                </el-menu-item>
                <el-menu-item index="/maps/view">
                    <el-icon>
                        <MapLocation />
                    </el-icon>
                    <span>ViewWhole</span>
                </el-menu-item>
            </el-sub-menu>
            <!-- 这里的template是虚拟标签，不会渲染成真实dom -->
            <template v-for="(item, index) in asideMenus" :key="index">
                <!-- 二级菜单 -->
                <el-sub-menu v-if="item.child && item.child.length > 0" :index="item.name">
                    <template #title>
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <span>{{ item.name }}</span>
                    </template>
                    <el-menu-item v-for="(item2, index2) in item.child" :key="index2" :index="item2.frontpath">
                        <el-icon>
                            <component :is="item2.icon" />
                        </el-icon>
                        <span>{{ item2.name }}</span>
                    </el-menu-item>
                </el-sub-menu>
                <!-- 一级菜单 -->
                <el-menu-item v-else :index="item.frontpath">
                    <el-icon>
                        <component :is="item.icon" />
                    </el-icon>
                    <span>{{ item.name }}</span>
                </el-menu-item>
            </template>
        </el-menu>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useAdminStore } from '@/store/useAdmin';
import useUserInfoStore from '@/store/userInfo';
import { computed } from 'vue';

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()
const userInfoStore = useUserInfoStore()


const isCollapse = computed(() => !(adminStore.menuAsideWidth === '250px'))
// 默认选中当先路由路径
// const defaultActive = ref(route.path)
const defaultActive = computed(() => route.fullPath)


const asideMenus = computed(() => userInfoStore.menus)


const handleSelect = (e) => {
    router.push(e)
}
</script>

<style scoped>
.f-menu::-webkit-scrollbar {
    width: 0;
}
</style>
