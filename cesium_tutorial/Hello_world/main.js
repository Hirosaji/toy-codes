(function() {
	"use strict";

	var viewer = new Cesium.Viewer("cesium");

	var viewer = new Cesium.Viewer("cesium");

	viewer.camera.setView({
		destination: Cesium.Cartesian3.fromDegrees(138, 30, 3000000),
		orientation: {
			heading: 0, // 水平方向の回転度（ラジアン）
			pitch: -1.3, // 垂直方向の回転度（ラジアン） 上を見上げたり下を見下ろしたり
			roll: 0
		}
	});

}());