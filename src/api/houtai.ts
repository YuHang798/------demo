import service from "@/axios";


export function getStatistics1() {
    return service.get('/admin/statistics1')
}



export function getStatistics2() {
    return service.get('/admin/statistics2')
}

export function getStatistics3(type: any) {
    return service.get('/admin/statistics3?type=' + type)
}