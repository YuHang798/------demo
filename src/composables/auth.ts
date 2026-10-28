import { useCookies } from '@vueuse/integrations/useCookies'

const tokenKey = 'admin-token'
const cookies = useCookies()


// 设置token
export function setToken(token: string) {
    return cookies.set(tokenKey, token)
}


// 得到token
export function getToken() {
    return cookies.get(tokenKey)
}


// 移除token
export function removeToken() {
    return cookies.remove(tokenKey)
}