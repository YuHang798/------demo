<template>
    <div class="aside-list flex items-center p-3 text-sm text-gray-600 cursor-pointer" :class="{ 'active': active }">
        <span class="truncate">
            <slot />
        </span>
        <el-button text type="primary" size="small" class="ml-auto" style="padding: 0 4px" @click.stop="$emit('edit')">
            <el-icon :size="12">
                <Edit />
            </el-icon>
        </el-button>
        <el-popconfirm title="是否要删除该分类?" confirm-button-text="确认" cancel-button-text="取消"
            @confirm.stop="$emit('delete')">
            <template #reference>
                <el-button text type="primary" size="small" style="padding: 0 4px;"">
                    <el-icon :size="12">
                    <Close />
                    </el-icon>
                </el-button>
            </template>
        </el-popconfirm>
    </div>
</template>


<script setup>

defineProps({
    active: {
        type: Boolean,
        default: false
    }
})

defineEmits(['edit', 'delete'])
</script>

<style>
.aside-list {
    border-bottom: 1px solid #f4f4f4;
}

.aside-list:hover,
.active {
    background-color: #eff6ef;
}
</style>