import { defineStore } from "pinia";
import { getInfo } from "@/api/manager";
import { toast } from "@/composables/utils";
import { removeToken } from "@/composables/auth";


export const useUserInfoStore = defineStore('userInfo', {
    state() {
        return {
            // 用户信息
            user: null,
            // 侧边菜单数据
            menus: [],
            ruleNames: []
        }
    },

    actions: {
        // 将管理员信息和权限菜单存入到pinia
        setUserInfo(user: any) {
            this.user = user
        },
        // 获取管理员信息和权限菜单,实现页面刷新不丢失，每次请求都是最新数据
        async getInfo() {
            try {
                const res = await getInfo()
                console.log(res)

                this.setMenus(res.data.menus)
                this.setRuleNames(res.data.ruleNames)

                this.setUserInfo(res)
                return res
            } catch (err) {
                toast('错误', '未能正常获取用户信息', 'error')
            }
        },

        logout() {
            // 清除cookie里面的token
            removeToken()


            // 清除当前用户状态pinia
            this.user = null
        },

        setMenus(menus: any) {
            this.menus = menus
        },

        setRuleNames(ruleNames: any) {
            this.ruleNames = ruleNames
        }
    }
})


export default useUserInfoStore