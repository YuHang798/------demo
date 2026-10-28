import { defineStore } from "pinia";


export const useAdminStore = defineStore('useAdmin', {
    state() {
        return {
            // 侧边宽度
            menuAsideWidth: '250px'
        }
    },
    actions: {
        // 设置侧边宽度
        setMenuAsideWidth() {
            this.menuAsideWidth = this.menuAsideWidth === '250px' ? '64px' : '250px'
        }
    }
})