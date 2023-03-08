<template>
    <div class="tips" v-if="loading">{{ status }}</div>
    <div id="context"></div>
    <div class="btn" v-if="queue.length > 1" @click="handlePre">返回</div>
</template>

<script setup lang="ts">
import axios from 'axios';
import * as echarts from 'echarts';
import { ref, Ref, onMounted, nextTick } from 'vue';
import { throttle } from '@/utils/throttle';

import { cityArray } from './data';


interface City {
    citycode: Array<unknown> | string
    adcode: string
    name: string
    center: string
    level: string
    districts: Array<City>
}

const defaultCity: City = {
    citycode: [],
    adcode: "100000",
    name: "中华人民共和国",
    center: "116.3683244,39.915085",
    level: "country",
    districts: []
}

let mainChart: echarts.ECharts
let options = {
    tooltip: {},
    title: {
        text: "地图下钻",
        subtext: "数据来源：高德地图，阿里DataV",
        y: "50px",
        x: "center",
        textStyle: {
        }
    },
    geo: [
        {
            tooltip: {
                show: false
            },
            emphasis: {
                label: {
                    fontSize: 24
                },
                itemStyle: {
                    areaColor: "#F07B91",
                    borderColor: "#F07B91"
                }
            },
            map: ""
        }
    ],
    series: {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        geoIndex: 0,
        symbolSize: function (params: Array<string | number>) {
            return (params[2] as number / 100) * 5 + 5;
        },
        tooltip: {
            show: true,
            formatter: function (params: any) {
                return `${params.data[3]}:${params.data[2]}`
            },
        },
        itemStyle: {
            color: 'rgb(128,173,209)'
        },
        encode: {
            tooltip: 2
        },
        data: [
            [116.40, 39.91, 100, "北京"],
            [120.21, 30.25, 50, "杭州"],
        ]
    }
}

let loading = ref(true)
let status = ref("初始化中...")
let queue: Ref<Array<string>> = ref([])



function initChart() {
    mainChart = echarts.init(document.getElementById('context') as HTMLElement);

    renderMapChart(defaultCity.name)

    // 绑定图表点击事件
    mainChart.on('click', 
        throttle((params) => {
            renderMapChart(params.name)
        })
    )

    // 监听页面大小变化
    window.onresize = () => {
        mainChart.resize()
    }


}

/**
 * 绘制地图
 * @param name 
 */
function renderMapChart(name: string) {
    getGeoJson(name).then(res => {
        if (res) {
            echarts.registerMap(name, { geoJSON: res, specialAreas: {} })

            options.geo[0].map = name

            mainChart.setOption(options)

        }
    })
}

// 返回上一级
function handlePre() {
    console.log(queue.value);
    if (queue.value.length > 1) {
        queue.value.pop()
        renderMapChart(queue.value[queue.value.length - 1])
    }
}

onMounted(() => {
    initChart()
})


/**
 * 递归获取高德行政区划数据
 * @param name 当前地区
 * @param dataArr 高德行政区划对象数组
 * @param result 城市的查询结果
 */
function getCityData(name: string, dataArr: Array<City>, result: City = defaultCity): City {
    dataArr.forEach(value => {
        if (name == value.name) {
            result = value
        } else {
            result = getCityData(name, value.districts, result)
        }
    })

    return result
}

/**
 * 获取当前地区对应 geojson 数据
 * @param name 当前地区
 */
async function getGeoJson(name: string) {
    loading.value = true
    status.value = '数据加载中'

    const city = getCityData(name, cityArray)

    let result = undefined

    // 从阿里 DataV 获取GEO数据
    await axios.get(`https://geo.datav.aliyun.com/areas_v3/bound/${city.adcode}_full.json`).then(res => {
        console.log({ res });
        if (res.status == 200) {
            result = res.data

            if (name != queue.value[queue.value.length - 1]) {
                queue.value.push(name)
            }
            loading.value = false
        }
    }).catch(err => {
        status.value = '数据获取失败'
        setTimeout(() => {
            loading.value = false
        }, 3000);
    })

    return result
}


</script>

<style>
#context {
    width: 100%;
    height: 100%;
}

.tips {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 600;
}

.btn {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 50px;
    height: 30px;
    background-color: #000;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
</style>