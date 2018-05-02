// 読み込みデータファイル
var DATA_FILE_PATH = './mac_plot.json';
handlingJson();

// JSONファイルを操作する
function handlingJson() {

	d3.queue()
	  .defer(d3.json, DATA_FILE_PATH)
	  .await(function(error, json) {
	  	if (error) throw error;

	  	var outputJSON = {
	  		"type": "FeatureCollection",
			"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
			"features": [],
	  	};
	  	outputJSON.features = [];

	  	json.forEach(function(value, i){
	  		console.log(value);
	  	})

        // JSON出力
        var data = JSON.stringify(outputGeoJSON);
        var a = document.createElement('a');
        a.textContent = 'export';
        a.download = 'outputGeoJSON.json';
        a.href = window.URL.createObjectURL(new Blob([data], { type: 'text/plain' }));
        a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');

        var exportLink = document.getElementById('export-link');
        exportLink.appendChild(a);

	});
};