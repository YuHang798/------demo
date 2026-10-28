<template>
    <el-main class="relative" v-loading="loading">
        <div class="top absolute top-0 left-0 right-0 bottom-12.5 p-3 overflow-y-auto overflow-x-hidden">
            <el-row :gutter="20">
                <el-col :span="6" :offset="0" v-for="(item, index) in list" :key="index">
                    <el-card shadow="hover" class="relative mb-3" :body-style="{ 'padding': 0 }">
                        <el-image :src="item.url" fit="cover" class="w-full h-37.5" :preview-src-list="[item.url]"
                            show-progress :initial-index="0"></el-image>
                        <div class="image-title px-2 py-1 text-sm truncate text-gray-100 bg- bg-gray-800/50">{{
                            item.name }}
                        </div>
                        <div class="flex items-center justify-center p-2">
                            <el-button type="primary" size="small" text @click="handleEdit(item)">重命名</el-button>
                            <el-popconfirm title="是否要删除该图片?" confirm-button-text="确认" cancel-button-text="取消"
                                @confirm="handleDelete(item.id)">
                                <template #reference>
                                    <el-button type="primary" size="small" text>删除</el-button>
                                </template>
                            </el-popconfirm>

                        </div>
                    </el-card>

                </el-col>
            </el-row>
        </div>
        <div class="bottom absolute left-0 right-0 bottom-0 flex justify-center items-center h-12.5">
            <el-pagination background layout="prev,pager, next" :total="total" :current-page="currentPage"
                :page-size="limit" @current-change="getData" />
        </div>

    </el-main>

    <el-drawer v-model="drawer" title="上传图片">
        <upload-file :data="{ image_class_id }" @success="handleUploadSuccess"></upload-file>
    </el-drawer>


</template>


<script setup>
import { deleteImage, getImageList, updateImage } from '@/api/image';
import { showPrompt, toast } from '@/composables/utils';
import { ref } from 'vue';
import UploadFile from './UploadFile.vue';
// 分页
const currentPage = ref(1)
const total = ref(0)
const limit = ref(10)

const image_class_id = ref(0)
const list = ref([])
const loading = ref(false)

// 抽屉
const drawer = ref(false)
const openUploadFile = () => drawer.value = true

async function getData(p = null) {
    try {
        if (typeof p === 'number') {
            currentPage.value = p
        }
        loading.value = true
        const res = await getImageList(image_class_id.value, currentPage.value)
        total.value = res.data.totalCount
        list.value = res.data.list
    } finally {
        loading.value = false
    }
}


// 根据分类id重新加载图片列表
const loadData = (id) => {
    currentPage.value = 1
    image_class_id.value = id
    getData()
}

// 重命名
const handleEdit = async (item) => {
    try {
        const res = await showPrompt('重命名', item.name)
        // console.log(res)
        loading.value = true
        console.log(item)
        await updateImage(item.id, res.value)
        toast('成功', '重命名成功', 'success')
        getData()
    } finally {
        loading.value = false
    }


}


// 删除图片
const handleDelete = async (id) => {
    try {
        loading.value = true
        await deleteImage([id])
        toast('成功', '删除成功', 'success')
        getData()
    } finally {
        loading.value = false
    }
}

// 图片上传成功
const handleUploadSuccess = () => {
    getData(1)
}

defineExpose({
    loadData,
    openUploadFile
})
</script>

<style>
.image-list {
    position: absolute;
    top: 122px;
    left: -1px;
    right: -1px;
}
</style>