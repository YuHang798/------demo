<template>
    <div>
        <el-row :gutter="20">
            <template v-if="panels.length === 0">
                <el-col :span="6" v-for="i in 4" :key="i">
                    <el-skeleton style="width: 100%">
                        <template #template>
                            <el-card shadow="hover">
                                <template #header>
                                    <div class="flex justify-between">
                                        <el-skeleton-item variant="text" style="width: 40%" />
                                        <el-skeleton-item variant="text" style="width: 10%" />
                                    </div>

                                </template>
                                <el-skeleton-item variant="text" style="width: 80%" />
                                <el-divider />
                                <div class="flex justify-between">
                                    <el-skeleton-item variant="text" style="width: 40%" />
                                    <el-skeleton-item variant="text" style="width: 10%" />
                                </div>
                            </el-card>
                        </template>
                    </el-skeleton>

                </el-col>
            </template>
            <el-col :span="6" :offset="0" v-for="(item, index) in panels" :key="index">
                <el-card shadow="hover">
                    <template #header>
                        <div class="flex justify-between">
                            <span>{{ item.title }}</span>
                            <el-tag :type="item.unitColor ? item.unitColor : 'success'" effect="plain">
                                {{ item.unit }}
                            </el-tag>
                        </div>

                    </template>
                    <span class="text-3xl text-gray-500 font-bold">
                        <CountTo :value="item.value" />
                    </span>
                    <el-divider />
                    <div class="flex justify-between">
                        <span>{{ item.subTitle }}</span>
                        <span>{{ item.subValue }}</span>
                    </div>
                </el-card>

            </el-col>
        </el-row>
        <IndexNavs />
        <el-row :gutter="20" class="mt-5">
            <el-col :span="12" :offset="0">
                <indexChart v-permission="['getStatistics3,GET']" />
            </el-col>
            <el-col :span="12" :offset="0">
                <indexCard title="店铺及商品提示" tip="店铺及商品提示" :btns="goods" class="mb-4.5" />
                <indexCard title="交易提示" tip="需要立即处理的交易订单" :btns="order" />
            </el-col>
        </el-row>

    </div>

</template>

<script setup>
import { getStatistics1, getStatistics2 } from '@/api/houtai';
import { ref } from 'vue';
import CountTo from '@/components/CountTo.vue';
import IndexNavs from '@/components/IndexNavs.vue';
import indexChart from '@/components/indexChart.vue';
import indexCard from '@/components/indexCard.vue';

const panels = ref([])
const goods = ref([])
const order = ref([])


const getStatistic = async () => {
    try {
        const res = await getStatistics1()
        panels.value = res.data.panels
        console.log(panels.value)
    } catch (err) {

    }
}

getStatistic()


const getSta = async () => {
    try {
        const res = await getStatistics2()
        console.log(res)
        goods.value = res.data.goods
        order.value = res.data.order

    } catch (err) {

    }
}
getSta()


</script>

<style scoped></style>
