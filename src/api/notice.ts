import service from "@/axios";




//公告列表
export function getNoticeList(page: number) {
    return service.get(`/admin/notice/${page}`)
}





// 增加公告
export function addNotice(data: Object) {
    return service.post(`/admin/notice`, data)
}

//修改公告
export function updateNotice(id: number, data: Object) {
    return service.post(`/admin/notice/${id}`, data)
}


//删除公告
export function deleteNotice(id: number) {
    return service.post(`/admin/notice/${id}/delete`)
}