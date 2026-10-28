<template>
    <div>
        <el-card shadow="never" style="border: 0;">
            <div class="flex justify-between items-center mb-2">
                <el-button type="primary" size="small" @click="addNoticeList">新增</el-button>
                <el-tooltip effect="dark" content="刷新" placement="bottom">
                    <el-button text @click="getData">
                        <el-icon :size="20">
                            <Refresh />
                        </el-icon>
                    </el-button>

                </el-tooltip>

            </div>

            <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
                <el-table-column prop="title" label="公告标题" />
                <el-table-column prop="create_time" label="发布时间" width="380" />
                <el-table-column label="操作" width="180" align="center">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="handleUpdate(scope.row)">
                            修改
                        </el-button>
                        <el-popconfirm title="是否要删除此条公告" placement="bottom-start" confirm-button-text="确认"
                            cancel-button-text="取消">
                            <template #reference>
                                <el-button type="danger" size="small">
                                    删除
                                </el-button>
                            </template>
                        </el-popconfirm>

                    </template>
                </el-table-column>
            </el-table>


            <div class=" flex justify-center items-center mt-5">
                <el-pagination background layout="prev,pager, next" :total="total" :current-page="currentPage"
                    :page-size="limit" @current-change="getData" />
            </div>

        </el-card>

        <form-drawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
            <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
                <el-form-item label="公告标题" prop="title">
                    <el-input v-model="form.title" placeholder="公告标题"></el-input>
                </el-form-item>
                <el-form-item label="公告内容" prop="content">
                    <el-input v-model="form.content" type="textarea" :row="5" placeholder="公告内容"></el-input>
                </el-form-item>
            </el-form>

        </form-drawer>


    </div>
</template>

<script setup>
import { addNotice, getNoticeList, updateNotice } from '@/api/notice';
import { computed, reactive, ref } from 'vue';
import FormDrawer from '@/components/FormDrawer.vue';
import { toast } from '@/composables/utils';

const tableData = ref([])
const formDrawerRef = ref(null)
const formRef = ref(null)
const loading = ref(false)


// 分页
const currentPage = ref(1)
const total = ref(0)
const limit = ref(10)

//表单数据
const form = reactive({
    title: '',
    content: ''
})

//表单验证规则
const rules = reactive({
    title: [
        {
            required: true,//表示必填
            message: '公告名称不能为空',//验证提示
            trigger: 'blur'//失去焦点时触发
        }],
    content: [
        {
            required: true,//表示必填
            message: '公告名称不能为空',//验证提示
            trigger: 'blur'//失去焦点时触发
        }]
})

//通过是否有id值来判断是新增还是修改
const editId = ref(0)
//通过计算属性来替换抽屉组件标题
const drawerTitle = computed(() => editId.value ? '修改' : '新增')

// 获取公告列表
const getData = async (p = null) => {
    if (typeof p === 'number') {
        currentPage.value = p
    }
    try {
        loading.value = true
        const res = await getNoticeList(currentPage.value)
        console.log(res)
        tableData.value = res.data.list
        total.value = res.data.totalCount
    } finally {
        loading.value = false
    }
}

// 增加公告
const addNoticeList = () => {
    //重置form里面的title与content
    form.title = ''
    form.content = ''
    editId.value = 0
    formDrawerRef.value.open()
}

//修改公告
const handleUpdate = (row) => {
    form.title = row.title
    form.content = row.content
    editId.value = row.id
    formDrawerRef.value.open()
}
//提交表单
const handleSubmit = async () => {
    try {
        await formRef.value.validate()
        formDrawerRef.value.showLoading()
        // 判断是调用新增函数还是修改函数
        editId.value ? await updateNotice(editId.value, form) : await addNotice(form)
        toast('成功', drawerTitle.value + '公告成功', 'success')
        getData(editId.value ? false : 1)
        //提交完成后将抽屉关闭
        formDrawerRef.value.close()
    } finally {
        formDrawerRef.value.closeLoading()
    }
}





getData()
</script>

<style scoped></style>
