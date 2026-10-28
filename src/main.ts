import { createApp } from 'vue'
import App from './App.vue'
//整体导入 ElementPlus 组件库
import ElementPlus from 'element-plus' //导入 ElementPlus 组件库的所有模块和功能 
import 'element-plus/dist/index.css' //导入 ElementPlus 组件库所需的全局 CSS 样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue' //导入 ElementPlus 组件库中的所有图标
import { createPinia } from 'pinia'
import '@/permission.ts'
import 'nprogress/nprogress.css'
import './output.css'
import { router } from './router/index.ts'
import permission from './directives/permission.ts'
const app = createApp(App)
const pinia = createPinia()

//注册 ElementPlus 组件库中的所有图标到全局 Vue 应用中
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(pinia)
app.use(ElementPlus)
app.use(router)
app.use(permission)

app.mount('#app')
