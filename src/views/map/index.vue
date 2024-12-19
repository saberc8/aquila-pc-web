<template>
	<div class="map">
		<div id="map" class="map-container"></div>
	</div>
</template>

<script setup>
// openlayer
import { ref, onMounted } from 'vue'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
const tiandiKey = '00051dd5b8ccad3f56b8ed0adc5b738d'
const map = ref(null)
const initMap = () => {
	map.value = new Map({
		target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: `http://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tiandiKey}`,
        }),
      }),
      new TileLayer({
        source: new XYZ({
          url: `http://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tiandiKey}`,
        }),
      }),
    ],
    view: new View({
      center: [12960000, 4850000],
      zoom: 10,
      projection: 'EPSG:3857',
    }),

	})
}
onMounted(() => {
	initMap()
	fetch('http://127.0.0.1:3000/channels/data/polyline_ban.geojson', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((response) => response.json())
		.then((data) => {
			console.log(data)
			map.value.addLayer(
				new VectorLayer({
					source: new VectorSource({
						features: new GeoJSON().readFeatures('http://127.0.0.1:3000/channels/data/polyline_ban.geojson', {
							//'4550'
							featureProjection: 'EPSG:3857',
						}),
					}),
				})
			)
		})
})
</script>

<style scoped lang="scss">
.map {
	width: 100vw;
	height: 100vh;
	background-color: cornflowerblue;
	.map-container {
		width: 100%;
		height: 100%;
	}
}
</style>
