<template>
    <el-drawer v-model="showdrawer" :title="title" size='45%' :close-on-click-modal=false
        :destroy-on-close='destroyOnClose'>
        <div class="flex flex-col relative" style="width: 100%;height: 100%;">
            <div class="absolute top-0 left-0 right-0 bottom-12.5  overflow-auto">
                <slot></slot>
            </div>
            <div class=" flex items-center mt-auto h-12.5">
                <el-button type="primary" @click="submit" :loading="loading">{{ confirmText }}</el-button>
                <el-button type="default" @click="close">取消</el-button>
            </div>
        </div>
    </el-drawer>
</template>

<script setup>;
import { ref } from 'vue';

const showdrawer = ref(false)
const loading = ref(false)


// 显示加载
const showLoading = () => loading.value = true
// 关闭加载按钮
const closeLoading = () => loading.value = false


// 打开抽屉
const open = () => showdrawer.value = true

// 关闭抽屉
const close = () => showdrawer.value = false

// 接受父组件传来的参数

const props = defineProps({
    title: String,
    // size: {
    //     type: String,
    //     default: '45%'
    // },
    destroyOnClose: {
        type: Boolean,
        default: false
    },
    confirmText: {
        type: String,
        default: '提交'
    }

})

// 子组件向父组件传递

const emits = defineEmits(['submit'])
const submit = () => emits('submit')


// 向外面暴露方法
defineExpose({
    open,
    close,
    showLoading,
    closeLoading
})


</script>

<style scoped></style>
