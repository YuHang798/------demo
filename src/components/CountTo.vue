<template>
    {{ d.num.toFixed(0) }}
</template>

<script setup>
import { reactive, watch } from 'vue';
import gsap from 'gsap'



const d = reactive({
    num: 0
})

const props = defineProps({
    value: {
        type: Number,
        default: 0
    }
})

function AnimateToValue() {
    gsap.to(d, {
        duration: 0.8,
        num: props.value
    })
}

AnimateToValue()

watch(() => d.num, () => AnimateToValue())

</script>

<style scoped></style>
