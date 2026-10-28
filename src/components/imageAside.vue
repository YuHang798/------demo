<template>
    <el-aside width="220px" class="image-aside relative" v-loading="loading">
        <div class="top absolute top-0 left-0 right-0 bottom-12.5 overflow-y-auto">

            <aside-list v-for="(item, index) in list" :key="item.id" :active="activeId === item.id"
                @edit="handleEdit(item)" @delete="handleDelete(item.id)" @click="handleChangeActiveId(item.id)">
                {{ item.name }}
            </aside-list>

        </div>
        <div class="bottom absolute left-0 right-0 bottom-0 flex justify-center items-center h-12.5">
            <el-pagination background layout="prev, next" :total="total" :current-page="currentPage" :page-size="limit"
                @current-change="getData" />
        </div>
    </el-aside>

    <form-drawer ref="formDrawerRef" :title="formTitle" @submit="handleSubmit">
        <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
            <el-form-item label="分类名称" prop="name">
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="排序" prop="order">
                <el-input-number v-model="form.order" :min="0" :max="2000" />
            </el-form-item>
        </el-form>

    </form-drawer>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import AsideList from './AsideList.vue';
import { createImageClass, deleteImageClass, getImageClassList, updataImageClass } from '@/api/image_class.ts';
import FormDrawer from './FormDrawer.vue';
import { toast } from '@/composables/utils.ts';


const list = ref([])
const formDrawerRef = ref(null)
const formRef = ref(null)
// 加载动画
const loading = ref(false)
const activeId = ref(0)
// 通过id来判别是新增还是修改
const editId = ref(0)
// 动态绑定表单标题
const formTitle = computed(() => editId.value ? '修改' : '新增')


// 分页
const currentPage = ref(1)
const total = ref(0)
const limit = ref(10)

// 获取图片分类数据
const getData = async (p = null) => {
    try {
        if (typeof p === 'number') {
            currentPage.value = p
        }
        loading.value = true
        const res = await getImageClassList(currentPage.value)
        total.value = res.data.totalCount
        list.value = res.data.list
        let item = list.value[0]
        if (item) {
            handleChangeActiveId(item.id)
        }
        console.log(res)
    } catch (err) {

    } finally {
        loading.value = false
    }
}


// 验证规则
const form = reactive({
    name: '',
    order: 1000
})

const rules = reactive({
    name: [
        {
            required: true,//表示必填
            message: '图库分类名称不能为空',//验证提示
            trigger: 'blur'//失去焦点时触发
        }
    ]
})

//新增图片分类
const handleCreate = () => {
    // 新增前要初始化form里面的name,order
    form.name = ''
    form.order = 1000
    // 让初始id值为0
    editId.value = 0
    formDrawerRef.value.open()
}

// 触发编辑的方法
const handleEdit = (row) => {
    console.log(row)
    // 让表单里的name,order变为当前点击的name,order
    form.name = row.name
    form.order = row.order
    // 让id值变为对应的数值
    editId.value = row.id
    // 打开抽屉
    formDrawerRef.value.open()
}
// 表单提交
const handleSubmit = async () => {
    try {
        await formRef.value.validate()
        console.log('提交成功')
        // 按钮loading动画
        formDrawerRef.value.showLoading()
        // 先判断是执行新增函数，还是修改函数
        const res = editId.value ? await updataImageClass(editId.value, form) : await createImageClass(form)
        toast('成功', formTitle.value + '成功', 'success', true)
        // 更新一下数据
        getData(editId.value ? currentPage.value : 1)
        // 将弹框关闭
        formDrawerRef.value.close()
    } catch (err) {

    } finally {
        formDrawerRef.value.closeLoading()
    }
}



getData()




// 触发删除的方法
const handleDelete = async (id) => {
    try {
        loading.value = true
        await deleteImageClass(id)
        toast('成功', '删除成功', 'success')
        getData()
    } finally {
        loading.value = false
    }
}

// 选中图库分类id
const emit = defineEmits(['change'])
function handleChangeActiveId(id) {
    activeId.value = id
    emit('change', id)
}

defineExpose({
    handleCreate
})


</script>

<style>
.image-aside {
    border-right: 1px solid #eeeeee;
}

.aside-list {
    border-bottom: 1px solid #f4f4f4;
}

.aside-list:hover,
.active {
    background-color: #eff6ef;
}
</style>