<template>
    <div>
        <el-container class="bg-white rounded" :style="{ height: h + 'px' }">
            <el-header class="image-header flex items-center">
                <el-button type="primary" size="small" @click="handleOpenCreate">新增图片分类</el-button>
                <el-button type="warning" size="small" @click="handleOpenUploadFile">上传图片</el-button>
            </el-header>
            <el-container>
                <image-aside ref="imageAsideRef" @change="handleAsideChange" />
                <image-main ref="imageMainRef" />
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import imageAside from '@/components/imageAside.vue';
import imageMain from '@/components/imageMain.vue';
import { ref } from 'vue';


const imageAsideRef = ref(null)
const imageMainRef = ref(null)
const windowHeight = window.innerHeight || document.body.clientHeight
const h = windowHeight - 64 - 44 - 40

const handleOpenCreate = () => {
    imageAsideRef.value.handleCreate()
}


const handleAsideChange = (image_class_id) => {
    console.log(image_class_id)
    imageMainRef.value.loadData(image_class_id)
}

// 打开上传图片抽屉
const handleOpenUploadFile = () => imageMainRef.value.openUploadFile()
</script>

<style scoped>
.image-header {
    border-bottom: 1px solid #eeeeee
}

.image-aside {
    border-right: 1px solid #eeeeee;
}
</style>
