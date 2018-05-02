// 読み込みデータファイル
var DATA_FILE_PATH = './mac_plot.json';
handlingJson();

// JSONファイルを操作する
function handlingJson() {

	d3.queue()
	  .defer(d3.json, DATA_FILE_PATH)
	  .await(function(error, json) {
	  	if (error) throw error;

	  	// var outputJSON = Object.assign({}, json);
	  	// outputJSON.features = [];

	  	json.forEach(function(value, i){
	  		console.log(value);
	  	})

	});
};