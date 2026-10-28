import service from "@/axios";


export function getImageList(id: number, page: number) {
    return service.get(`/admin/image_class/${id}/image/${page}`)
}


export function updateImage(id: number, name: string) {
    return service.post(`/admin/image/${id}`, { name })
}


export function deleteImage(ids: number[]) {
    return service.post(`/admin/image/delete_all`, { ids })
}

export const uploadImageAction = '/api/admin/image/upload'