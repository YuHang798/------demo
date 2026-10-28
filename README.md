# 后台管理系统 demo

基于 **Vue 3 + Vite + TypeScript + Element Plus** 的后台管理系统，附带一个 **OpenLayers 地图模块**，以及一个**滚动式过渡的首页 → 登录页**。

前端工程化程度较高：动态路由、动态菜单、标签页、按钮级权限、统一请求封装都已落地；业务页面部分完成，其余为占位页，可在此基础上继续扩展。

---

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [快速开始](#快速开始)
- [后端接口](#后端接口)
- [路由与权限](#路由与权限)
- [状态管理](#状态管理)
- [项目约定](#项目约定)
- [如何新增一个后台页面](#如何新增一个后台页面)
- [完成度](#完成度)
- [已知问题](#已知问题)
- [路线图](#路线图)

---

## 功能特性

### 登录与鉴权

- 登录页为**滚动式过渡**：首页 →（遮罩开孔）→ 地理卡片 →（分屏）→ 登录表单，全部由滚动进度驱动，登录表单本身仍是原来的 `login.vue`。
- 登录成功后 token 写入 **Cookie**（key：`admin-token`），后续每个请求由 axios 拦截器自动带上 `token` 请求头。
- 无 token 访问任何非 `/login` 页面会被守卫拦回登录页；已登录再访问 `/login` 会被弹回上一页。

### 动态菜单 + 动态路由

- 登录后调用 `POST /admin/getinfo` 拿到后端下发的**权限菜单树**与**按钮权限码**。
- 前端维护一份 `asyncRoutes` 路由池，`addRoutes()` 按菜单里的 `frontpath` 从池子里捞出对应的路由记录，再用 `router.addRoute('admin', …)` 动态挂载。
- 侧边菜单、标签页、按钮权限全部由这份数据驱动 —— 换句话说：**后端给什么菜单，前端就有什么页面**。

### 标签页导航

- 右侧页签自动跟随路由变化，可关闭、可「关闭其他 / 全部关闭」。
- 页签状态持久化在 Cookie（key：`TabList`），刷新不丢。

### 按钮级权限

```vue
<indexChart v-permission="['getStatistics3,GET']" />
```

`v-permission` 指令会比对 `userInfoStore.ruleNames`，不匹配时直接把元素从 DOM 移除（而不是隐藏）。

### 后台首页（仪表盘）

- 四张统计卡片（数值动画 `CountTo`），数据来自 `GET /admin/statistics1`。
- 「店铺及商品提示 / 交易提示」两组快捷入口卡片，数据来自 `GET /admin/statistics2`。
- 交易统计柱状图，可在「日 / 周 / 月」之间切换，数据来自 `GET /admin/statistics3?type=…`。
- 数据未返回时显示骨架屏。

### 通用组件

| 组件 | 用途 |
| --- | --- |
| `FormDrawer` | 抽屉式表单容器，带 `open / close / showLoading / closeLoading` |
| `UploadFile` | 多图上传（走 `/api/admin/image/upload`） |
| `imageAside` / `imageMain` | 图片库的左分类树 + 右图片网格 |
| `CountTo` | 数字滚动动画 |
| `IndexNavs` / `indexCard` / `indexChart` | 仪表盘的快捷入口 / 提示卡 / 图表 |
| `AsideList` | 侧边列表容器 |

### 地图模块（OpenLayers）

- `ol-map-view-tilelayer-tutorial.vue`：加载**天地图**矢量底图（`vec_w`）+ 注记层（`cva_w`），提供放大、缩小、回到北京三个按钮。
- `ViewWhole.vue`：占位页，待补充。

> 天地图需要 `tk` 密钥，代码里写死在 `TIANDITU_KEY` 常量，正式使用请换成自己的 key 并从环境变量注入。

---

## 技术栈

| 分类 | 技术 | 版本 |
| --- | --- | --- |
| 框架 | Vue | ^3.5.40 |
| 路由 | vue-router（hash 模式） | ^5.3.1 |
| 状态 | Pinia | ^4.0.3 |
| UI 组件库 | Element Plus | ^2.14.5 |
| 图标 | @element-plus/icons-vue | 全局注册 |
| 样式 | Tailwind CSS（v4，`@tailwindcss/vite`） | ^4.3.3 |
| 构建 | Vite | ^8.1.5 |
| 语言 | TypeScript | ~6.0.0 |
| 类型检查 | vue-tsc | ^3.3.7 |
| 请求 | axios | ^1.20.0 |
| 地图 | OpenLayers（`ol`） | ^10.10.0 |
| 图表 | ECharts | ^6.1.0 |
| 工具库 | @vueuse/core、@vueuse/integrations | ^14.4.0 |
| 其他 | nprogress、dayjs、lodash-es、sortablejs、qrcode、zxcvbn、jwt-decode、drauu、tippy.js | — |

**运行环境**：Node `^22.18.0 || >=24.12.0`

---

## 目录结构

```
后台管理系统demo/
├─ public/
│  ├─ favicon.ico
│  └─ images/
│     ├─ login-bg.jpg          登录页左侧背景图（大峡谷）
│     ├─ 小云朵.jpg             顶栏用户头像
│     └─ cards/c1~c4.jpg       滚动首页的四张地理卡（海岸 / 沙丘 / 戈壁 / 雪山）
│
├─ src/
│  ├─ api/                     接口封装，一个业务一个文件
│  │  ├─ manager.ts            登录、用户信息、退出、改密、管理员列表
│  │  ├─ houtai.ts             仪表盘统计 statistics1/2/3
│  │  ├─ notice.ts             公告 CRUD
│  │  ├─ image.ts              图片列表 / 改名 / 批量删除 / 上传地址
│  │  └─ image_class.ts        图片分类 CRUD
│  │
│  ├─ components/              通用组件（见上方「通用组件」表）
│  │  └─ GeoStage.vue          滚动首页第二层的「地理卡片」内容
│  │
│  ├─ composables/
│  │  ├─ auth.ts               token 的读写（Cookie: admin-token）
│  │  ├─ utils.ts              toast / showModel / showPrompt / NProgress
│  │  └─ scrollProgress.ts     滚动进度引擎（帧率无关 + 惯性缓动）
│  │
│  ├─ directives/
│  │  └─ permission.ts         v-permission 指令
│  │
│  ├─ layouts/
│  │  ├─ Admin.vue             后台主布局（Header + Aside + Main）
│  │  └─ components/
│  │     ├─ FHeader.vue        顶栏：折叠、刷新、全屏、改密、退出
│  │     ├─ FMenu.vue          侧边菜单（静态「地图系列」+ 动态菜单）
│  │     ├─ FTagList.vue       标签页
│  │     └─ Maps/              OpenLayers 示例页
│  │
│  ├─ pages/
│  │  ├─ welcome.vue           ⭐ 滚动式首页（首页 → 地理卡片 → 登录）
│  │  ├─ login.vue             登录表单本体（被 welcome.vue 内嵌）
│  │  ├─ index.vue             后台首页 / 仪表盘
│  │  ├─ 404.vue               404
│  │  ├─ notice/list.vue       公告管理（已实现）
│  │  ├─ manager/list.vue      管理员管理（已实现）
│  │  ├─ image/list.vue        图片库（已实现）
│  │  └─ goods / category / user / order / comment / coupon / setting   占位页
│  │
│  ├─ store/
│  │  ├─ userInfo.ts           用户信息、菜单、权限码
│  │  └─ useAdmin.ts           侧边栏宽度等界面状态
│  │
│  ├─ router/index.ts          路由表 + addRoutes 动态注入
│  ├─ permission.ts            全局前置 / 后置守卫
│  ├─ axios.ts                 axios 实例与请求 / 响应拦截器
│  ├─ main.ts                  应用入口
│  ├─ App.vue                  根组件 + 全局样式
│  └─ output.css               Tailwind 入口
│
├─ index.html
├─ vite.config.ts              别名 @ → src、/api 代理、Tailwind 插件
├─ tsconfig.app.json / tsconfig.node.json / tsconfig.json
├─ env.d.ts
└─ package.json
```

---

## 快速开始

### 环境要求

- Node.js `^22.18.0 || >=24.12.0`
- npm（或 pnpm / yarn）

### 安装与启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 3. 生产构建（先类型检查，再打包到 dist/）
npm run build

# 4. 本地预览构建产物
npm run preview

# 5. 只做类型检查，不打包
npm run type-check
```

### 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器（HMR） |
| `npm run build` | `run-p type-check build-only` —— 并行执行类型检查与打包 |
| `npm run build-only` | 只打包，不做类型检查 |
| `npm run preview` | 预览 `dist/` |
| `npm run type-check` | `vue-tsc --build` |

---

## 后端接口

### 代理配置

前端所有请求统一以 `/api` 开头，由 Vite 开发服务器代理到测试后端：

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://ceshi13.dishait.cn',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')   // 转发时去掉 /api 前缀
    }
  }
}
```

> ⚠️ 该域名是**公开测试后端**，只适合练手。正式部署需要换成自己的服务地址，并在生产环境用 Nginx 或类似方式做同样的 `/api` 转发（`rewrite` 那一步在生产同样要处理）。

### 请求约定

- axios 实例 `baseURL = '/api'`（`src/axios.ts`）。
- 请求拦截器：有 token 就写入 `config.headers['token']`。
- 响应拦截器：**直接返回 `response.data`**，所以业务代码里拿到的是 `{ data: { … } }` 这一层，再往里取数据就是 `res.data.xxx`。
- 错误处理：统一 `toast('失败', msg, 'error')`；如果后端返回 `非法token，请先登录！`，自动清 token + 刷新页面回到登录。

### 接口清单

**管理端 / 鉴权（`src/api/manager.ts`）**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/admin/login` | 登录（`x-www-form-urlencoded`：`username`、`password`） |
| POST | `/admin/getinfo` | 获取用户信息 + 菜单 + 按钮权限码 |
| POST | `/admin/logout` | 退出登录 |
| POST | `/admin/updatepassword` | 修改密码（`oldpassword`、`password`、`repassword`） |
| GET | `/admin/manager/:page` | 管理员列表（`params.query`：`limit`、`keyword`） |

**仪表盘（`src/api/houtai.ts`）**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/admin/statistics1` | 顶部四张统计卡 |
| GET | `/admin/statistics2` | 店铺/商品、交易提示 |
| GET | `/admin/statistics3?type=` | 交易趋势图数据 |

**公告（`src/api/notice.ts`）**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/admin/notice/:page` | 列表 |
| POST | `/admin/notice` | 新增 |
| POST | `/admin/notice/:id` | 修改 |
| POST | `/admin/notice/:id/delete` | 删除 |

**图片分类（`src/api/image_class.ts`）**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/admin/image_class/:page` | 列表 |
| POST | `/admin/image_class` | 新增 |
| POST | `/admin/image_class/:id` | 修改 |
| POST | `/admin/image_class/:id/delete` | 删除 |

**图片（`src/api/image.ts`）**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/admin/image_class/:id/image/:page` | 某分类下的图片列表 |
| POST | `/admin/image/:id` | 重命名 |
| POST | `/admin/image/delete_all` | 批量删除（`{ ids: number[] }`） |
| — | `/api/admin/image/upload` | 上传地址常量 `uploadImageAction` |

---

## 路由与权限

### 路由表

用的是 **hash 模式**（`createWebHashHistory`），部署到任何静态服务器都不用配 rewrite。

**静态路由（`routes`）**

| 路径 | 组件 | 说明 |
| --- | --- | --- |
| `/` | `layouts/Admin.vue` | 后台布局，name 为 `admin` |
| `/maps/tileLayer` | `Maps/ol-map-view-tilelayer-tutorial.vue` | 天地图底图示例 |
| `/maps/view` | `Maps/ViewWhole.vue` | 占位 |
| `/login` | `pages/welcome.vue` | 滚动式首页 + 登录 |
| `/:pathMatch(.*)*` | `pages/404.vue` | 兜底 404 |

**动态路由池（`asyncRoutes`）** —— 需要后端菜单返回对应 `frontpath` 才会被挂载：

| 路径 | 页面 | 标题 |
| --- | --- | --- |
| `/` | `index.vue` | 后台首页 |
| `/goods/list` | `goods/GoodsList.vue` | 商品管理 |
| `/category/list` | `category/CategoryList.vue` | 分类管理 |
| `/user/list` | `user/list.vue` | 用户列表 |
| `/order/list` | `order/list.vue` | 订单列表 |
| `/comment/list` | `comment/list.vue` | 评价列表 |
| `/image/list` | `image/list.vue` | 图片列表 |
| `/notice/list` | `notice/list.vue` | 公告列表 |
| `/setting/base` | `setting/base.vue` | 配置列表 |
| `/coupon/list` | `coupon/list.vue` | 优惠券列表 |
| `/manager/list` | `manager/list.vue` | 管理员管理 |

### 守卫流程

`src/permission.ts` 里只有一个 `beforeEach`，顺序如下：

```
1. showFullLoading()                      // 顶部进度条开始
2. 取 token（Cookie: admin-token）
3. 没 token 且目标不是 /login  → toast 警告，跳到 /login
4. 有 token 且目标是 /login    → toast 报错，退回上一页
5. 有 token 且是首次      → await userInfoStore.getInfo()
                          → addRoutes(menus) 动态挂载路由
6. document.title = meta.title + '-openlayers学习'
7. 如果这次新增了路由       → { path: to.fullPath, replace: true } 重新导航一次
8. afterEach → hideFullLoading()
```

> 「新增了路由要重新导航一次」是动态路由的关键：首次进入时目标页面还不存在，会被 404 兜底匹配，必须加完路由后再走一遍。

---

## 状态管理

| Store | 文件 | 状态 | 主要 action |
| --- | --- | --- | --- |
| `userInfo` | `store/userInfo.ts` | `user`、`menus`、`ruleNames` | `getInfo()`、`setUserInfo()`、`setMenus()`、`setRuleNames()`、`logout()` |
| `useAdmin` | `store/useAdmin.ts` | `menuAsideWidth` | `setMenuAsideWidth()`（250px ⇄ 64px 折叠） |

`ruleNames` 就是按钮权限码数组（形如 `['getStatistics3,GET', …]`），供 `v-permission` 使用。

---

## 项目约定

- **token**：Cookie，key 为 `admin-token`，读写统一走 `composables/auth.ts`。
- **页签**：Cookie，key 为 `TabList`。
- **请求**：业务代码只调 `src/api/*.ts` 里导出的函数，不要在组件里直接 `axios`。
- **返回值**：拦截器已解包，拿到的是 `res`（含 `data`），所以取数据写 `res.data.xxx`。
- **提示**：统一用 `composables/utils.ts` 的 `toast()`（内部是 `ElNotification`）。
- **Element Plus**：`main.ts` 里**全量注册**了组件与全部图标，所以模板里可以直接用 `<el-xxx>` 和 `<Fold />` 这类图标，无需逐个 import。
- **样式**：能用 Tailwind 原子类就用，复杂结构才写 `<style scoped>`。

---

## 如何新增一个后台页面

以「优惠券管理」为例（该页面已有占位，可直接替换内容）：

1. **写页面**：`src/pages/coupon/list.vue`。
2. **确认路由池里有它**：`src/router/index.ts` 的 `asyncRoutes` 中应存在 `{ path: '/coupon/list', name: '/coupon/list', component: CouponList, meta: { title: '优惠券列表' } }`。
3. **让后端菜单返回这个路径**：菜单项的 `frontpath` 必须与路由 `path` 完全一致，否则 `addRoutes` 不会挂载。
4. **（可选）加按钮权限**：给元素加 `v-permission="['权限码,GET']"`，并确保 `getinfo` 返回的 `ruleNames` 里有这个码。
5. 重启 / 刷新页面即可在侧边菜单中看到。

---

## 完成度

| 模块 | 状态 | 备注 |
| --- | --- | --- |
| 登录 / 鉴权 / 守卫 | ✅ 完成 | 含 Cookie token、动态路由 |
| 动态菜单 + 标签页 | ✅ 完成 | 侧边菜单、页签持久化 |
| 按钮级权限 `v-permission` | ✅ 完成 | 基于 `ruleNames` |
| 后台首页仪表盘 | ✅ 完成 | 统计卡 / 图表 / 快捷入口 / 骨架屏 |
| 公告管理 | ✅ 完成 | 增删改查 + 分页 |
| 管理员管理 | ✅ 完成 | 列表 + 搜索 + 分页 |
| 图片库 | ✅ 完成 | 分类树 + 上传 + 改名 + 批量删除 |
| 滚动式首页 | ✅ 完成 | 首页 → 地理卡片 → 登录 |
| 地图：TileLayer | ✅ 完成 | 天地图矢量 + 注记 |
| 地图：ViewWhole | 🚧 占位 | 只有一个标题 |
| 商品 / 分类 / 用户 / 订单 / 评价 / 优惠券 / 配置 | 🚧 占位 | 各 8 行骨架页，接上接口即可 |

---

## 已知问题

1. **路由里的大小写隐患**
   `src/router/index.ts` 中写的是 `import Admin from '@/layouts/admin.vue'`，而实际文件名是 `Admin.vue`。
   在 Windows（文件系统大小写不敏感）下没问题，但 **Linux / macOS / CI 构建会找不到模块**。建议统一改为 `@/layouts/Admin.vue`。

2. **表单校验长度是示例值**
   登录与改密表单把密码限制成了 3–5 个字符，接真实业务时应放宽（例如 ≥ 6）并补充强度校验（项目已引入 `zxcvbn`，可直接用）。

3. **后端是公开测试域名**
   `http://ceshi13.dishait.cn` 随时可能失效或限流，生产环境务必替换。

4. **`toast()` 默认 `dangerouslyUseHTMLString = true`**
   如果消息内容来自用户输入，会有 XSS 风险；接后端文案时建议传 `false`。

5. **天地图密钥写死在代码里**
   `ol-map-view-tilelayer-tutorial.vue` 中的 `TIANDITU_KEY` 应改为从 `.env` 读取（`import.meta.env.VITE_TIANDITU_KEY`），并记得在 `.gitignore` 里排除真实 key。

6. **`package.json` 里残留 `windicss`**
   `vite-plugin-windicss` / `windicss` 已安装但 `vite.config.ts` 中并未启用，样式实际走 Tailwind v4。可以择机移除这两个依赖。

---

## 路线图

- [ ] 补齐商品、分类、用户、订单、评价、优惠券、配置模块
- [ ] 完成 `ViewWhole` 地图页（视图缩放 / 定位到某个坐标系）
- [ ] 把地图 `tk`、后端域名抽到 `.env`
- [ ] 统一修正文件名大小写，保证跨平台构建
- [ ] 增加 401 自动跳登录的全局兜底
- [ ] 接入代码规范（ESLint + Prettier）与提交钩子

---

## 参考

- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://vite.dev/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)
- [Vue Router 文档](https://router.vuejs.org/zh/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [OpenLayers 文档](https://openlayers.org/doc/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

> 本项目为学习 / 练习用途，未附带开源许可证。
