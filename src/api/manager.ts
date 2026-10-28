import service from "@/axios";

export function login(username: string, password: string) {
    // 转成 x-www-form-urlencoded 格式
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    return service.post('/admin/login', formData)
}

export function getInfo() {
    return service.post('/admin/getinfo')
}


// 退出登录
export function logout() {
    return service.post('/admin/logout')
}


//修改密码
interface formPassword {
    oldpassword: string,
    password: string,
    repassword: string
}
export function rePassword(data: formPassword) {
    // 转成 x-www-form-urlencoded 格式
    const formData = new URLSearchParams();
    formData.append("oldpassword", data.oldpassword);
    formData.append("password", data.password);
    formData.append('repassword', data.repassword)
    return service.post('/admin/updatepassword', formData)
}


//管理员列表
export interface ManagerListQuery {
    limit?: number,
    keyword?: string
}

export function getManagerList(page: number, query: ManagerListQuery) {
    return service.get(`/admin/manager/${page}`, { params: { query } })
}