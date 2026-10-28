<template>
    <div class="map-container">
        <div ref="mapRef" class="map"></div>

        <div class="controls">
            <button @click="zoomIn">放大</button>
            <button @click="zoomOut">缩小</button>
            <button @click="reset">回到北京</button>
        </div>
    </div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref, shallowRef } from 'vue';
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import { XYZ } from 'ol/source';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';



const TIANDITU_KEY = '90ecb9c12281f2cca096e7dce35a626b'
const mapRef = ref(null)
const mapInstance = shallowRef(null)


onMounted(() => {
    const vecLayer = new TileLayer({
        source: new XYZ({
            url: `https://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${TIANDITU_KEY}`
        })
    })
    const cvaLayer = new TileLayer({
        source: new XYZ({
            url: `https://t{0-7}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${TIANDITU_KEY}`
        })
    })


    const centerLonLat = [116.397428, 39.90923] // 北京
    const view = new View({
        center: fromLonLat(centerLonLat),
        zoom: 9,
        minZoom: 3,
        maxZoom: 19,
        projection: 'EPSG:3857'
    })

    const map = new Map({
        target: mapRef.value,
        layers: [vecLayer, cvaLayer],
        view: view,
        controls: []
    })


    mapInstance.value = map
    // 监听地图点击事件，获取点击坐标
    map.on('click', (evt) => {
        console.log('点击坐标(EPSG:3857):', evt.coordinate)

    })
})

onBeforeMount(() => {
    if (mapInstance.value) {
        mapInstance.value.setTarget(null)
        mapInstance.value = null
    }
})




const zoomIn = () => {
    const view = mapInstance.value.getView()
    const currentZoom = view.getZoom()
    view.setZoom(currentZoom + 1)
}

const zoomOut = () => {
    const view = mapInstance.value.getView()
    const currentZoom = view.getZoom()
    view.setZoom(currentZoom - 1)
}

const reset = () => {
    const view = mapInstance.value.getView()
    view.animate({
        center: fromLonLat([116.397428, 39.90923]),
        zoom: 9,
        duration: 1000
    })
}
</script>

<style scoped>
.map-container {
    position: relative;
    width: 100%;
    height: 100vh;
}

.map {
    width: 100%;
    height: 100%;
}

.controls {
    position: absolute;
    top: 30px;
    left: 30px;
    display: flex;
    justify-items: center;
    align-items: center;
    gap: 8px;
}

button {
    padding: 6px 14px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    background-color: #fff;
    cursor: pointer;
}

button:hover {
    background-color: #f0f0f0;
}
</style>
