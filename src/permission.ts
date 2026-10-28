import { router, addRoutes } from "./router";
import { getToken } from "./composables/auth";
import { hideFullLoading, showFullLoading, toast } from "./composables/utils";
import useUserInfoStore from "./store/userInfo";

let hasGetInfo = false


// 全局前置守卫
router.beforeEach(async (to, from) => {
    showFullLoading()
    // console.log(to, from)
    const userInfoStore = useUserInfoStore()
    // 获取token
    const token = getToken()
    // 判断是否有token以及前往的页面是否为login.vue,如果不是就回到login.vue
    if (!token && to.path != '/login') {
        toast('警告', '请先登录!', 'warning')
        return { path: '/login' }
    }

    // 如果有token并且你还想要回登录页面，就阻止它，让他在首页
    if (token && to.path === '/login') {
        toast('错误', '请勿重复登录', 'error')
        return { path: from.path }
    }

    let hasNewRoutes = false


    if (token && !hasGetInfo) {
        const res = await userInfoStore.getInfo()
        hasGetInfo = true
        hasNewRoutes = addRoutes(res?.data.menus)



    }

    // 设置页面标题
    let title = (to.meta.title ? to.meta.title : '') + '-openlayers学习'
    document.title = title


    if (hasNewRoutes) {
        return { path: to.fullPath, replace: true }
    }

    return

})


// 全局后置守卫
router.afterEach(() => {
    hideFullLoading()
})