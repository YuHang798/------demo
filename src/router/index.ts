import { createRouter, createWebHashHistory } from 'vue-router'



import Index from '@/pages/index.vue'
import Login from '@/pages/login.vue'
import Welcome from '@/pages/welcome.vue'   // ← 新增这一行
import NotFound from '@/pages/404.vue'
import Admin from '@/layouts/admin.vue'
import GoodsList from '@/pages/goods/GoodsList.vue'
import CategoryList from '@/pages/category/CategoryList.vue'
import olMapViewTilelayerTutorial from '@/layouts/components/Maps/ol-map-view-tilelayer-tutorial.vue'
import ViewWhole from '@/layouts/components/Maps/ViewWhole.vue'
import UserList from '@/pages/user/list.vue'
import OrderList from '@/pages/order/list.vue'
import CommentList from '@/pages/comment/list.vue'
import ImageList from '@/pages/image/list.vue'
import NoticeList from '@/pages/notice/list.vue'
import SettingBase from '@/pages/setting/base.vue'
import CouponList from '@/pages/coupon/list.vue'
import ManagerList from '@/pages/manager/list.vue'





// 设置默认静态公共路由
const routes = [
    {
        path: '/',
        name: 'admin',
        component: Admin,
        meta: {
            title: '用户学习端'
        },
        children: [{
            path: '/maps/tileLayer',
            name: 'tileLayer',
            component: olMapViewTilelayerTutorial,
            meta: {
                title: 'TileLayer'
            }
        }, {
            path: '/maps/view',
            name: 'viewwhole',
            component: ViewWhole,
            meta: {
                title: 'ViewWhole'
            }
        }]
    },
    // {
    //     path: '/login',
    //     component: Login,
    //     meta: {
    //         title: '登录页'
    //     }
    // },
    // 改之后
    {
        path: '/login',
        component: Welcome,        // ← 改成 welcome.vue
        meta: {
            title: '登录页'
        }
    },

    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        meta: {
            title: '错误页'
        }
    },

]



// 动态路由，用于匹配菜单动态添加路由
const asyncRoutes = [{
    path: '/',
    name: '/',
    component: Index,
    meta: {
        title: '后台首页'
    }
},
{
    path: '/goods/list',
    name: '/goods/list',
    component: GoodsList,
    meta: {
        title: '商品管理'
    }
}, {
    path: '/category/list',
    name: '/category/list',
    component: CategoryList,
    meta: {
        title: '分类管理'
    }
}, {
    path: '/user/list',
    name: '/user/list',
    component: UserList,
    meta: {
        title: '用户列表'
    }
}, {
    path: '/order/list',
    name: '/order/list',
    component: OrderList,
    meta: {
        title: '订单列表'
    }
}, {
    path: '/comment/list',
    name: '/comment/list',
    component: CommentList,
    meta: {
        title: '评价列表'
    }
}, {
    path: '/image/list',
    name: '/image/list',
    component: ImageList,
    meta: {
        title: '图片列表'
    }
}, {
    path: '/notice/list',
    name: '/notice/list',
    component: NoticeList,
    meta: {
        title: '公告列表'
    }
}, {
    path: '/setting/base',
    name: '/setting/base',
    component: SettingBase,
    meta: {
        title: '配置列表'
    }
}, {
    path: '/coupon/list',
    name: '/coupon/list',
    component: CouponList,
    meta: {
        title: '优惠券列表'
    }
}, {
    path: '/manager/list',
    name: '/manager/list',
    component: ManagerList,
    meta: {
        title: '管理员管理'
    }
}]


// 动态添加路由的方法
export function addRoutes(menus: any) {
    // 是否有新路由
    let hasNewRoutes = false
    const findAndAddAsyncRoutes = (arr: any) => {
        arr.forEach((e: any) => {
            let item = asyncRoutes.find(o => o.path === e.frontpath)
            if (item && !router.hasRoute(item.name)) {
                router.addRoute('admin', item)
                hasNewRoutes = true
            }
            if (e.child && e.child.length > 0) {
                findAndAddAsyncRoutes(e.child)
            }
        })
    }
    findAndAddAsyncRoutes(menus)
    // 获取现存的路由
    // console.log(router.getRoutes())
    return hasNewRoutes
}



export const router = createRouter({
    history: createWebHashHistory(),
    routes
})

