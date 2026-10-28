<template>

    <el-row :gutter="20" class="mt-6">
        <el-col :span="3" :offset="0" v-for="(item, index) in iconNavs" :key="index">
            <el-card shadow="hover" @click="router.push(item.path)">
                <div class="flex flex-col justify-center items-center cursor-pointer">
                    <el-icon :style="{ color: item.color }">
                        <component :is="item.icon" />
                    </el-icon>
                    <span>{{ item.title }}</span>
                </div>
            </el-card>

        </el-col>
    </el-row>


</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter()


const iconNavs = [
    {
        icon: "user",
        color: "#fdba74",
        title: "用户",
        path: "/user/list"
    },
    {
        icon: "shopping-cart",
        color: "#8b5cf6",
        title: "商品",
        path: "/goods/list"
    },
    {
        icon: "tickets",
        color: "#d946ef",
        title: "订单",
        path: "/order/list"
    },
    {
        icon: "chat-dot-square",
        color: "#14b8a6",
        title: "评价",
        path: "/comment/list"
    },
    {
        icon: "picture",
        color: "#f43f5e",
        title: "图库",
        path: "/image/list"
    },
    {
        icon: "bell",
        color: "#22c55e",
        title: "公告",
        path: "/notice/list"
    },
    {
        icon: "set-up",
        color: "#9ca3af",
        title: "配置",
        path: "/setting/base"
    },
    {
        icon: "files",
        color: "#facc15",
        title: "优惠券",
        path: "/coupon/list"
    }
]
</script>

<style scoped></style>
