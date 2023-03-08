# 地图下钻，标注

可视化（又名：大屏，驾驶舱等）常有的需求  
最简单的实现方式就是基于echarts在有 geojson 数据的情况下可以快速实现  
> https://geojson.org/

该项目中的数据来自高德地图及阿里DataV  

> https://datav.aliyun.com/portal/school/atlas/area_selector

使用了高德的全国行政区划数据  
阿里DataV提供的 geojson 数据，数据最多到区，实际项目要用的数据一般要到乡镇，精度要求不高的话DataV有边界生成器可以自己圈，或者只能通过其他渠道获取（可能会收费）
> https://hxkj.vip/demo/echartsMap/
> https://github.com/TangSY/echarts-map-demo

下钻实现的思路很简单
1. 绑定 echarts 点击事件
2. 用当前选择的地区 geojson 数据重新注册地图，并替换option对应的name 然后重新设置option

本项目中 用数组保存了下钻过程 来实现返回上级功能  
geojson 使用 DataV 测试链接，可能会失效

其余具体配置可在 echarts 文档查询
> https://echarts.apache.org/zh/option.html#title

## Demo环境
node 18.14.2


