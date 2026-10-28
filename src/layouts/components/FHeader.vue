<template>
    <div class="flex items-center bg-indigo-700 text-lime-50 h-16 fixed top-0 left-0 right-0 z-100">
        <span class="flex justify-center items-center w-62.5 text-xl font-thin">
            <el-icon class="mr-2">
                <ElemeFilled />
            </el-icon>
            OpenLayers
        </span>
        <el-tooltip effect="dark" content="折叠" placement="bottom">
            <el-icon class="flex justify-center cursor-pointer hover:bg-indigo-600" style="width: 42px;height: 64px;"
                @click="adminStore.setMenuAsideWidth()">
                <Fold v-if="adminStore.menuAsideWidth === '250px'" />
                <Expand v-else />
            </el-icon>
        </el-tooltip>


        <el-tooltip effect="dark" content="刷新" placement="bottom">
            <el-icon class="flex justify-center cursor-pointer  hover:bg-indigo-600" style="width: 42px;height: 64px;"
                @click="handleRefresh">
                <Refresh />
            </el-icon>
        </el-tooltip>

        <div class="ml-auto flex items-center">
            <el-tooltip class="box-item" effect="dark" content="全屏" placement="bottom">
                <el-icon class="flex justify-center cursor-pointer  hover:bg-indigo-600"
                    style="width: 42px;height: 64px;" @click="toggle">
                    <FullScreen v-if="!isFullscreen" />
                    <Aim v-else />
                </el-icon>
            </el-tooltip>

            <el-dropdown class="flex justify-center items-center h-16 cursor-pointer mx-5" @command="handleCommand">
                <span class=" flex items-center text-lime-50">
                    <el-avatar class="mr-2" :size="25" src="/images/小云朵.jpg" />
                    {{ userInfoStore.user?.data.username ? userInfoStore.user.data.username : '' }}
                    <el-icon class="el-icon--right">
                        <arrow-down />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="rePassword">修改密码</el-dropdown-item>
                        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
    //抽屉
    <form-drawer ref="formDrawerRef" title="修改密码" @submit="onSubmit">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="small">
            <el-form-item prop="oldpassword" label="旧密码">
                <el-input v-model="form.oldpassword" placeholder="请输入旧密码">
                </el-input>
            </el-form-item>
            <el-form-item prop="password" label="新密码">
                <el-input type="password" show-password v-model="form.password" placeholder='请输入账号新密码'>
                </el-input>
            </el-form-item>
            <el-form-item prop="repassword" label="确认密码">
                <el-input type="password" show-password v-model="form.repassword" placeholder='请输入账号新密码'>
                </el-input>
            </el-form-item>
        </el-form>
    </form-drawer>


</template>

<script setup>
import { logout, rePassword } from '@/api/manager';
import { showModel, toast } from '@/composables/utils';
import { useRouter } from 'vue-router';
import useUserInfoStore from '@/store/userInfo';
import { useFullscreen } from '@vueuse/core'
import { ref, reactive } from 'vue'
import FormDrawer from '@/components/FormDrawer.vue';
import { useAdminStore } from '@/store/useAdmin';

const { isFullscreen, toggle } = useFullscreen()
const adminStore = useAdminStore()
// -------------------------------------------------修改密码--------------------------------------------------
const formDrawerRef = ref(null)


const form = reactive({
    oldpassword: '',
    password: '',
    repassword: ''
})
const formRef = ref(null)
const router = useRouter()


const userInfoStore = useUserInfoStore()
// 验证规则
const rules = reactive({
    oldpassword: [
        {
            required: true,//表示必填
            message: '旧密码不能为空',//验证提示
            trigger: 'blur'//失去焦点时触发
        },
        {
            min: 3,
            max: 5,
            message: '旧密码长度必须是3-5个字符',
            trigger: 'blur'
        },
    ],
    password: [
        {
            required: true,//表示必填
            message: '新密码不能为空',//验证提示
            trigger: 'blur'//失去焦点时触发
        },
        {
            min: 3,
            max: 5,
            message: '密码长度必须是3-5个字符',
            trigger: 'blur'
        },
    ],
    repassword: [
        {
            required: true,//表示必填
            message: '确认密码不能为空',//验证提示
            trigger: 'blur'//失去焦点时触发
        },
        {
            min: 3,
            max: 5,
            message: '确认密码长度必须是3-5个字符',
            trigger: 'blur'
        },
    ]


})
// 修改后确认函数
const onSubmit = async () => {
    try {
        await formRef.value.validate()
        formDrawerRef.value.showLoading()
        const res = await rePassword(form)
        toast('成功', '修改密码成功', 'success')
        //退出登录，清除cookie与store
        userInfoStore.logout()
        // 路由跳转到登录页
        router.push('/login')


    } catch (err) {
        console.log(err)
    }
    finally {
        formDrawerRef.value.closeLoading()
    }
}


// switch选择退出登录||修改密码
function handleCommand(c) {
    switch (c) {
        case 'logout':
            handleLogout()
            break;
        case 'rePassword':
            formDrawerRef.value.open()
            break
    }
}



// 刷新函数
const handleRefresh = () => {
    location.reload()
}

// 退出登录函数
function handleLogout() {
    showModel('提示', '你要退出此界面吗', 'info').then((res) => {
        logout()

    }).finally(() => {
        // 清除cookie和pinia里面的user
        userInfoStore.logout()


        // 跳转到登录界面
        router.push('/login')

        // 提示退出成功
        toast('成功', '退出登录成功', 'success')
    })
}


</script>

<style scoped></style>
