import service from "@/axios";
import { id } from "element-plus/es/locale/index.mjs";


export function getImageClassList(page: number) {
    return service.get('/admin/image_class/' + page)
}

// 增加图库分类
export function createImageClass(data: any) {
    return service.post('/admin/image_class', data)
}

// 修改图库分类
export function updataImageClass(id: number, data: any) {
    return service.post('/admin/image_class/' + id, data)
}

// 删除图库分类
export function deleteImageClass(id: number) {
    return service.post('/admin/image_class/' + id + '/delete')
}

