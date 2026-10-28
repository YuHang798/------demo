<template>
    <!-- 行容器：满屏高度 -->
    <el-row class="bg-indigo-500 h-screen">
        <!-- 左列：占16份 -->
        <el-col :lg="16" :md="12" class="relative overflow-hidden ">
            <div class="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style="background-image: url('/images/login-bg.jpg')"></div>

            <div class="absolute inset-0 bg-linear-to-r from-indigo-600/30 to-indigo-500/10"></div>
            <!-- 内层容器：占满列高度，内容水平垂直居中 -->
            <div class="h-full flex justify-center items-center relative z-10 ">
                <div>
                    <div class="font-bold text-5xl text-lime-50 mb-4">您好，张嘉辉！</div>
                    <div class="text-gray-200 text-sm">此站是OpenLayer模块化作品展示网站,点击立即进入</div>
                </div>
            </div>
        </el-col>

        <!-- 右列：占8份，白色背景 -->
        <el-col :lg="8" :md="12" class="bg-white">
            <div class="h-full flex justify-center items-center flex-col">
                <h2 class="font-bold text-gray-800 text-3xl">欢迎回来</h2>
                <div class="flex justify-center items-center my-5 text-gray-300 space-x-2">
                    <span class="h-px w-4 bg-gray-200"></span>
                    <span>账号密码登录</span>
                    <span class="h-px w-4 bg-gray-200"></span>
                </div>
                <el-form ref="formRef" :model="form" class="w-62.5" :rules="rules">
                    <el-form-item prop="username">
                        <el-input v-model="form.username" placeholder="请输入姓名或账号">
                            <template #prefix>
                                <el-icon>
                                    <User />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input type="password" show-password v-model="form.password" placeholder='请输入账号密码'>
                            <template #prefix>
                                <el-icon>
                                    <Lock />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button class="w-62.5" type="primary" round color='#626aef' :loading="loading"
                            @click="onSubmit">登录</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-col>
    </el-row>
</template>


<script setup>
import { reactive, ref, onMounted, onBeforeMount } from 'vue'
import { login } from '@/api/manager'
import { useRouter } from 'vue-router'
import { toast } from '@/composables/utils'
import { setToken } from '@/composables/auth'

// do not use same name with ref
const form = reactive({
    username: '',
    password: ''
})

const rules = reactive({
    username: [
        {
            required: true,//表示必填
            message: '用户名不能为空',//验证提示
            trigger: 'blur'//失去焦点时触发
        },
        {
            min: 3,
            max: 5,
            message: '用户名长度必须是3-5个字符',
            trigger: 'blur'
        },
    ],
    password: [
        {
            required: true,//表示必填
            message: '密码不能为空',//验证提示
            trigger: 'blur'//失去焦点时触发
        },
        {
            min: 3,
            max: 5,
            message: '密码长度必须是3-5个字符',
            trigger: 'blur'
        },
    ]
})


const formRef = ref(null)
const router = useRouter()
const loading = ref(false)
const onSubmit = async () => {
    try {
        await formRef.value.validate()
        loading.value = true
        const res = await login(form.username, form.password)

        console.log(res.data.token)
        // 提示登录成功
        toast('成功', '登录成功！', 'success')
        // 设置token
        setToken(res.data.token)
        // 跳转到后台首页
        router.push('/')
    } catch (err) {
        toast('失败', '账号或密码错误', 'error')
    } finally {
        loading.value = false
    }
}

function keyUp(e) {
    if (e.key === 'Enter') {
        onSubmit()
    }
}

onMounted(() => {
    // 监听键盘点击事件
    document.addEventListener('keyup', keyUp)
})
onBeforeMount(() => {
    document.removeEventListener('keyup', keyUp)
})


</script>

<style scoped></style>
