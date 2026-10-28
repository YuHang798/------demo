import type { App } from "vue"
import useUserInfoStore from "@/store/userInfo"



function hasPermission(value: string[], el: HTMLElement) {
    if (!Array.isArray(value)) {
        throw new Error(`需要配置权限,例如v-permission="['getStatistics3, GET']"`)
    }
    const userInfoStore = useUserInfoStore()
    const ruleNames: string[] = userInfoStore.ruleNames || []
    const hasAuth = value.findIndex(v => ruleNames.includes(v)) != -1
    if (el.parentNode && !hasAuth) {
        el.parentNode.removeChild(el)
    }
}






export default {
    install(app: App) {
        app.directive('permission', {
            mounted(el, binding) {
                hasPermission(binding.value, el)
            }
        })
    }
}