<template>
    <div>
        <el-card shadow="never">
            <template #header>
                <div class=" flex items-center">
                    <span>订单统计</span>
                    <div class="flex gap-3 ml-auto">
                        <el-check-tag :checked="current === item.value" v-for="(item, index) in options" :key="index"
                            @click="handleChoose(item.value)">
                            {{ item.text }}
                        </el-check-tag>
                    </div>
                </div>
            </template>
            <div ref='el' id="chart" style="width: 100%;height: 300px;"></div>
        </el-card>

    </div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import { getStatistics3 } from '@/api/houtai';
import { useResizeObserver } from '@vueuse/core'



const current = ref('week')
const el = ref(null)
let myChart = null


onMounted(() => {
    const chartDom = document.getElementById('chart')
    if (chartDom) {
        myChart = echarts.init(chartDom)

        getData()

    }
})


// 销毁echart实例
onBeforeMount(() => {
    if (myChart) echarts.dispose(myChart)
})

const handleChoose = (type) => {
    current.value = type
    getData()
}

const getData = async () => {

    let option = {
        xAxis: {
            type: 'category',
            data: []
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [],
                type: 'bar'
            }
        ]
    };

    //显示加载
    myChart.showLoading()
    try {
        const res = await getStatistics3(current.value)
        console.log(res)
        option.xAxis.data = res.data.x
        option.series[0].data = res.data.y
        myChart.setOption(option);
    } catch (err) {
        console.log(err)
    } finally {
        myChart.hideLoading()
    }


}


useResizeObserver(el, (entries) => {
    if (myChart) {
        myChart.resize()
    }
})



const options = [{
    text: '近1个月',
    value: 'month'
}, {
    text: '近1周',
    value: 'week'
}, {
    text: '近24小时',
    value: 'hour'
}]
</script>

<style scoped></style>
