<template>
    <div class="flex items-center fixed top-16 right-0 z-100 h-11 px-2 bg-gray-100"
        :style="{ left: adminStore.menuAsideWidth }">
        <el-tabs v-model="activeTab" type="card" class="demo-tabs" style="min-width: 100px;" @tab-change="changeTab"
            @tab-remove="removeTab">
            <el-tab-pane v-for="item in tabList" :key="item.path" :label="item.title" :name="item.path"
                :closable="item.path != '/'">
            </el-tab-pane>
        </el-tabs>

        <span class="flex justify-center items-center ml-auto w-8 h-8 bg-white">
            <el-dropdown @command="handleClose">
                <span class="el-dropdown-link">
                    <el-icon>
                        <arrow-down />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="clearOther">关闭其他</el-dropdown-item>
                        <el-dropdown-item command="clearAll">全部关闭</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </span>
    </div>
    <div style="height: 44px;"></div>
</template>

<script setup>

import { ref } from 'vue'
import { useAdminStore } from '@/store/useAdmin'
import { useRoute, onBeforeRouteUpdate, useRouter } from 'vue-router'
import { useCookies } from '@vueuse/integrations/useCookies.js'

const adminStore = useAdminStore()
const route = useRoute()
const router = useRouter()
const cookies = useCookies()


// const activeTab = computed(() => route.fullPath)
const activeTab = ref(route.fullPath)
const tabList = ref([

    {

        title: '主控台',
        path: '/'
    }
])


// 添加标签导航的方法
function addTab(tab) {
    let isHasTab = tabList.value.findIndex((item) => item.path === tab.path) === -1
    if (isHasTab) {
        tabList.value.push(tab)
    }
    cookies.set('TabList', tabList.value)
}

// 初始化标签列表
const initTabList = () => {
    const initList = cookies.get('TabList')
    if (initList) {
        tabList.value = initList
    }
}

initTabList()


// 移除标签的方法
const removeTab = (t) => {
    const tabs = tabList.value
    let a = activeTab.value
    if (t === a) {
        tabs.forEach((tab, index) => {
            if (t === tab.path) {
                const nextTab = tabs[index + 1] || tabs[index - 1]
                if (nextTab) {
                    a = nextTab.path
                }

            }
        })
    }
    activeTab.value = a
    tabList.value = tabList.value.filter((tab) => {
        return tab.path != t
    })
    // console.log(tabList.value)
    cookies.set('TabList', tabList.value)
    // 真正跳到新激活的标签
    if (a != t) {
        router.push(a)
    }
}


// 清除标签的方法
const handleClose = (c) => {
    if (c === 'clearOther') {
        // 保留后台首页与当前激活页
        tabList.value = tabList.value.filter((tab) => {
            return tab.path === '/' || tab.path === activeTab.value
        })
    } else if (c === 'clearAll') {
        // 切换回首页
        activeTab.value = '/'
        // 让tabList只剩下首页
        tabList.value = [{
            title: '后台首页',
            path: '/'
        }]
        // 跳转到后台首页
        router.push('/')
    }
    cookies.set('TabList', tabList.value)
}


onBeforeRouteUpdate((to, from) => {
    // 再添加之前，设置标签的激活状态
    activeTab.value = to.fullPath
    addTab({
        title: to.meta.title,
        path: to.fullPath
    })
})


function changeTab(t) {
    router.push(t)
}

</script>

<style scoped>
:deep(.el-tabs__header) {
    margin-bottom: 0;
    border: 0;
}

:deep(.el-tabs__nav) {
    border: 0 !important;
}

:deep(.el-tabs__item) {
    height: 32px;
    line-height: 32px;
    border: 0 !important;
    border-radius: 4px;
    background-color: white;
    margin: 0 4px;
}

:deep(.el-tabs__nav-next),
:deep(.el-tabs__nav-prev) {
    height: 32px;
    line-height: 32px;
}
</style>
