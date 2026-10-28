<template>
    <div>
        <el-card shadow="never">
            <template #header>
                <div class="flex justify-between">
                    <span>{{ title }}</span>
                    <el-tag type="danger" effect="plain">
                        {{ tip }}
                    </el-tag>
                </div>

            </template>
            <el-row :gutter="20">
                <el-col :span="6" :offset="0" v-for="(item, index) in btns" :key="index">
                    <el-card shadow="hover" style="border: 0; background-color: #F6F6F6;">
                        <div class="flex flex-col justify-center items-center">
                            <span class="text-xl mb-2">{{ item.label }}</span>
                            <span class="text-xs text-gray-500">{{ item.value }}</span>
                        </div>
                    </el-card>

                </el-col>

            </el-row>

        </el-card>

    </div>
</template>

<script setup>
defineProps({
    title: String,
    tip: String,
    btns: Array
})


</script>

<style scoped></style>
