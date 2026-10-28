<template>
    <el-upload drag :action='uploadImageAction' multiple :headers="{ token }" name="img" :data="data"
        :on-success="handleSuccess" :on-error="handleError">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
            <div class="el-upload__tip">
                jpg/png files with a size less than 500kb
            </div>
        </template>
    </el-upload>
</template>

<script setup>
import { uploadImageAction } from '@/api/image';
import { toast } from '@/composables/utils';
import { getToken } from '@/composables/auth';
const token = getToken()


// 文件上传成功时的钩子
const emit = defineEmits(['success'])
const handleSuccess = (response, uploadFile, uploadFiles) => {
    console.log(response)
    emit('success', {
        response, uploadFile, uploadFiles
    })
}

const handleError = (error, uploadFile, uploadFiles) => {
    toast('失败', JSON.parse(error.message).msg, 'error')
}

defineProps({
    data: Object
})
</script>