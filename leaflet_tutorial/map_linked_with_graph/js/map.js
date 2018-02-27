!(function(){
	"use strict";

	var initLatLng = [38, 135];
	var map = L.map('mapid', {maxZoom: 10, minZoom: 5}).setView(initLatLng, 5);

	// 地図の表示範囲を制限
	var cityBounds = [[50, 112], [25, 158]];
	var cityRect = L.rectangle(cityBounds, {fillOpacity: 0, weight: 0});
	cityRect.addTo(map);
	map.setMaxBounds(cityBounds);

	// csvの読み込み
	d3.queue()
	  .defer(d3.json, '../data/allGuests.json')
	  .defer(d3.json, '../data/foreignGuests.json')
	  .defer(d3.json, '../data/prefecturesGeoJSON.geojson')
	  .await(function(error, allGuestsData, foreignGuestsData, geojson) {
	  	if (error) throw error;

	  	// 都道府県のローマ字を漢字に直すための辞書
	  	var prefecturesIndex = { "Tottoei":"鳥取県", "Nara":"奈良県", "Shiga":"滋賀県", "Gifu":"岐阜県", "Toyama":"富山県", "Kyoto":"京都府", "Fukui":"福井県", "Yamanashi":"山梨県", "Saitama":"埼玉県", "Gunma":"群馬県", "Tochigi":"栃木県", "Shizuoka":"静岡県", "Nagano":"長野県", "Ibaragi":"茨城県", "Chiba":"千葉県", "Fukushima":"福島県", "Yamagata":"山形県", "Akita":"秋田県", "Iwate":"岩手県", "Aomori":"青森県", "Yamaguchi":"山口県", "Ehime":"愛媛県", "Shimane":"島根県", "Hiroshima":"広島県", "Okayama":"岡山県", "Hyogo":"兵庫県", "Kagawa":"香川県", "Kochi":"高知県", "Tokushima":"徳島県", "Osaka":"大阪府", "Wakayama":"和歌山県", "Aichi":"愛知県", "Mie":"三重県", "Ishikawa":"石川県", "Tokyo":"東京都", "Kanagawa":"神奈川県", "Nigata":"新潟県", "Miyagi":"宮城県", "Fukuoka":"福岡県", "Oita":"大分県", "Saga":"佐賀県", "Kumamoto":"熊本県", "Kagoshima":"鹿児島県", "Miyazaki":"宮崎県", "Nagasaki":"長崎県", "Okinawa":"沖縄県", "Hokkaido":"北海道" };
	  	var InvPrefecturesIndex = inverseObject(prefecturesIndex);

	  	// 都道府県のclickイベントを管理する辞書
	  	var opacityDist = {};
	  	var clickdDist = {};
	  	for(var key in prefecturesIndex){
	  		opacityDist[key] = 0;
	  		clickdDist[key] = false;
	  	}

		// 色の塗り分けの初期設定
		var year = "2017";
		var month = "9";

		// 各データをマージしたgeoJSON
		var newGeoJSON = geojsonMergeGuestsData(allGuestsData, foreignGuestsData, geojson);
		// console.log(newGeoJSON);

		// 折れ線グラフで使うデータセット
		var graphDataset = prepareLineGraphData(newGeoJSON);
		// console.log(graphDataset);
		drawLineChart(graphDataset, year, month);

		// 地理データの描画
		var baseLayer = L.geoJson(newGeoJSON, {
				style: style,
				onEachFeature: onEachFeature
			}).addTo(map);

		// 選択エリアのステータスを表示
		var info = L.control();

		info.onAdd = function(map) {
			this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
			this.update();
			return this._div;
		};

		info.update = function(props) {
			if(props){
				var allGuestsNum = props.allGuestsData[year][month];
				var foreignGuestsNum = props.foreignGuestsData[year][month];
				var foreignRatio = Number(foreignGuestsNum.replace(/,/g, ''))/Number(allGuestsNum.replace(/,/g, ''));

				this._div.innerHTML = "<h4>宿泊旅行統計 (<span id='legendDate'>" + year + "年" + month + "月" + "</span>)</h4>"
				+ '<b>' + props.prefecturesName
				+ '</b><br />宿泊客総数: ' + allGuestsNum + " 人"
				+ '</b><br />外国人宿泊客数: ' + foreignGuestsNum + " 人"
				+ '</b><br />外国人宿泊客の割合: ' + Math.floor(foreignRatio*1000)/10 + "%";
			} else {
				this._div.innerHTML = "<h4>宿泊旅行統計 (<span id='legendDate'>" + year + "年" + month + "月" + "</span>)</h4>Hover over a land";
			}
		};

		info.addTo(map);

		// // resizeイベント
		// d3.select(window).on("resize", resize, graphDataset);

		// geoJSONと各データをマージする関数
		function geojsonMergeGuestsData(allGuestsData, foreignGuestsData, geojson){

			margeData(allGuestsData, "allGuestsData", geojson);
			margeData(foreignGuestsData, "foreignGuestsData", geojson);

			function margeData(guestsData, dataName, geojson){

				Object.keys(guestsData).forEach(function(prefecturesInfo){
					for(var i=0; i<geojson.features.length; i++){
						var prefecturesJap = prefecturesIndex[geojson.features[i].properties.ObjName_1];
						if(prefecturesInfo == prefecturesJap){
							geojson.features[i].properties[dataName] = guestsData[prefecturesJap];
							geojson.features[i].properties.prefecturesName = prefecturesInfo;
						}
					}
				});

			}
			return geojson;

		}

		function drawLineChart(graphDataset){

			// 描画領域やマージンを設定
			var margin = {top: 30, right: 80, bottom: 30, left: 50},
				w = parseInt(d3.select("#graphid").style("width")),
				h = parseInt(d3.select("#graphid").style("height")),
				width = w - margin.left - margin.right,
				height = h - margin.top - margin.bottom;
			var svg = d3.select("#graphid").append("svg").attr("width", w).attr("height", h),
				g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			// 日付のパース
			var parseTime = d3.timeParse("%Y%m");

			// データを整形
			graphDataset.map(function(d){
				d.date = parseTime(d.date);
				d.ratio = +d.ratio;
			});
			// console.log(graphDataset);

			// x,y軸スケールのrangeの設定
			var x = d3.scaleTime().range([0, width]),
			    y = d3.scaleLinear().range([height, 0]);

			// 折れ線情報の設定
			var line = d3.line()
						 .curve(d3.curveBasis)
						 .x(function(d) { return x(d.date); })
						 .y(function(d) { return y(d.ratio); });

			// x,y軸スケールのdomainを設定
			x.domain(d3.extent(graphDataset, function(d) { return d.date; }));
			y.domain([0, Math.max.apply(null, graphDataset.map( function(d){ return d.ratio; } ))]);

			// x,y軸の描画
			g.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));
			g.append("g")
				.attr("class", "axis axis--y")
				.call(d3.axisLeft(y))
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", "0.71em")
				.attr("fill", "#000")
				.text("外国人宿泊客の割合, %");

			var perPrefectureData = getPerPrefectureData(graphDataset);

			var allTerms = perPrefectureData[0].map(function(d){
				return d.date;
			});

			// 折れ線グラフを描画
			perPrefectureData.forEach(function(prefectureData){

				// 背景側の折れ線の描画
				var backPrefecture = g.selectAll(".backline")
					.data(perPrefectureData)
					.enter().append("g")
					.attr("class", "prefecture");

				backPrefecture.append("path")
					.attr("class", "backline")
					.attr("d", function(d) { return line(d); });

				// clickイベントで表示する折れ線の描画
				var prefecture = g.selectAll(".line")
					.data(perPrefectureData)
					.enter().append("g")
					.attr("class", "prefecture");

				prefecture.append("path")
					.attr("class", function(d) { return "line line__" + InvPrefecturesIndex[d[0].area]; })
					.attr("d", function(d) { return line(d); });

				prefecture.append("text")
					.attr("class", function(d) { return "text text__" + InvPrefecturesIndex[d[0].area]; })
					.datum(function(d) { return {area: d[0].area, value: d[d.length-1]}; })
					.style("opacity", 0)
					.attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.ratio) + ")"; })
					.attr("x", 3)
					.attr("dy", "0.35em")
					.style("font", "10px sans-serif")
					.text(function(d) { return d.area; });

			});

			// 選択中のrectの属性を置いておく
			var selectedRect = year + month;

			// 選択されている年月の目印を描画
			var selectedTime = g.selectAll(".rect")
				.data(allTerms)
				.enter();

			// 折れ線グラフのclickイベントで発火するrectを描画
			selectedTime.append("rect")
				.attr("x", function(d){ return x(d); })
				.attr("y", 0)
				.style("opacity", 0)
				.attr("height", height)
				.attr("class", function(d) {
					var thisTime = date2YearMonth(d);
					return "selectedTime__backRect rect__" + thisTime["year"]+thisTime["month"];
				});

			// 折れ線グラフのmouseoverイベントで発火するrectを描画
			selectedTime.append("rect")
				.attr("x", function(d){ return x(d); })
				.attr("y", 0)
				.attr("height", height)
				.attr("class", "selectedTime__rect")
				.text(function(d) { return d; })
				.on("mouseover", function(d){
					d3.select(this).style("opacity", 0.4);
					// rectに連動するテキストのopacityを変更
					var thisTime = date2YearMonth(this.textContent);
					d3.select(".text__"+thisTime["year"]+thisTime["month"]).style("opacity", 1);
					d3.select(".mark__"+thisTime["year"]+thisTime["month"]).style("opacity", 1);
				})
				.on("click", function(d){
					var thisTime = date2YearMonth(this.textContent);
					year = String(thisTime["year"]);
					month = String(thisTime["month"]);
					// mouseover時に出現するrectを、click時には消す
					d3.select(this).style("opacity", 0);
					// 前のclickイベントで選択されていたrect、markのopacityを変更
					d3.select(".rect__"+selectedRect).style("opacity", 0);
					d3.select(".marked__"+selectedRect).style("opacity", 0);
					// 今回のclickイベントで選択されたrect、markの情報を更新＆opacityを変更
					selectedRect = year + month;
					d3.select(".rect__"+selectedRect).style("opacity", 0.9);
					d3.select(".marked__"+selectedRect).style("opacity", 1);
					// 地図の塗り分けをclickした年月に変更
					baseLayer.setStyle(style);
					// legendの年月を変更
					d3.select("#legendDate").text(year + "年" + month + "月");
				})
				.on("mouseout", function(d){
					d3.select(this).style("opacity", 0);
					// rectに連動するテキストのopacityを変更
					var thisTime = date2YearMonth(this.textContent);
					d3.select(".text__"+thisTime["year"]+thisTime["month"]).style("opacity", 0);
					d3.select(".mark__"+thisTime["year"]+thisTime["month"]).style("opacity", 0);
				});

			// 折れ線グラフのmouseoverイベントに連動するテキスト①を描画
			selectedTime.append("text")
				.attr("x", function(d){ return x(d)-30; })
				.attr("y", -18)
				.style("opacity", 0)
				.style("font-size", "12px")
				.attr("class", function(d) {
					var thisTime = date2YearMonth(d);
					return "text__" + thisTime["year"]+thisTime["month"];
				})
				.text(function(d){
					var thisTime = date2YearMonth(d);
					return thisTime["year"]+"年"+thisTime["month"]+"月";
				});

			// 折れ線グラフのmouseoverイベントに連動するテキスト②を描画
			selectedTime.append("text")
				.attr("x", function(d){ return x(d)-5.5; })
				.attr("y", -4)
				.style("opacity", 0)
				.style("font-size", "15px")
				.attr("class", function(d) {
					var thisTime = date2YearMonth(d);
					return "mark__" + thisTime["year"]+thisTime["month"];
				})
				.text("▼");

			// 折れ線グラフのclickイベントで発火するテキストを描画
			selectedTime.append("text")
				.attr("x", function(d){ return x(d)-5.5; })
				.attr("y", -4)
				.style("opacity", 0)
				.style("font-size", "15px")
				.style("fill", "red")
				.attr("class", function(d) {
					var thisTime = date2YearMonth(d);
					return "marked__" + thisTime["year"]+thisTime["month"];
				})
				.text("▼");

			// 初期表示しておくrectとテキストを設定
			d3.select(".rect__"+String(year)+String(month)).style("opacity", 0.9);
			d3.select(".marked__"+String(year)+String(month)).style("opacity", 1);

		}

		// parse済みのDateから年月を抽出する関数
		function date2YearMonth(date){
			var time = new Date(date);
			var year = time.getFullYear();
			var month = time.getMonth()+1;
			return {"year": year, "month": month};
		}

		// 折れ線グラフで使うデータセットを作成する関数
		function prepareLineGraphData(newGeoJSON){

			var handlingData = newGeoJSON.features;
			var outputDataset = [];

			handlingData.forEach(function(areaData){
				var thisAreaName = areaData.properties.prefecturesName;
				var thisAreaData = areaData.properties.allGuestsData;
				Object.keys(thisAreaData).forEach(function(year) {
					var thisYearData = thisAreaData[year];
					Object.keys(thisYearData).forEach(function(month){
						var tempDist = {};
						if(month.length==1){ var thisMonth = "0" + month; } else { var thisMonth = month; }
						var thisDate = year + thisMonth;
						var thisRatio = Math.floor( Number(areaData.properties.foreignGuestsData[year][month].replace(/,/g, '')) / Number(areaData.properties.allGuestsData[year][month].replace(/,/g, '')) * 1000)/10;
						tempDist.date = thisDate;
						tempDist.ratio = thisRatio;
						tempDist.area = thisAreaName;
						outputDataset.push(tempDist);
					});
				});
			});
			return outputDataset;

		}

		// 都道府県ごとに切り分けたデータを返す
		function getPerPrefectureData(data){

			var prefecturesName = [];
			data.forEach(function(d){
				if(prefecturesName.indexOf(d.area) === -1){
					prefecturesName.push(d.area);
				}
			});

			var outputList = [];
			prefecturesName.forEach(function(prefectureName){
				var prefectureDataList = data.filter(function(d){
					return (d.area === prefectureName);
				});
				outputList.push(prefectureDataList);
			});

			return outputList;

		}

		// 色の塗り分け処理
		function getColor(d) {
			return d > 22.5 ? '#67000d' :
				   d > 20  ? '#a50f15' :
				   d > 17.5  ? '#cb181d' :
				   d > 15  ? '#ef3b2c' :
				   d > 12.5  ? '#fb6a4a' :
				   d > 10  ? '#fc9272' :
				   d > 7.5  ? '#fcbba1' :
				   d > 5  ? '#fee0d2' :
				   d > 2.5  ? '#fff5f0' :
				   d > 0  ? '#ffffff' :
							  'gray';
		}

		function style(feature) {
			var allGuestsNum = feature.properties.allGuestsData[year][month];
			var foreignGuestsNum = feature.properties.foreignGuestsData[year][month];
			var foreignRatio = Number(foreignGuestsNum.replace(/,/g, ''))/Number(allGuestsNum.replace(/,/g, ''));
			return {
				fillColor: getColor(Math.floor(foreignRatio*1000)/10),
				weight: 2,
				opacity: 1,
				color: 'white',
				fillOpacity: 0.7
			};
		}

		// ハイライト表示関数(mouseoverイベント)
		function highlightFeature(e) {
			var layer = e.target;

			layer.setStyle({
				weight: 5,
				color: '#666',
				fillOpacity: 0.7
			});

			if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
				layer.bringToFront();
			}

			info.update(layer.feature.properties);
		}

		// ハイライト表示リセット関数(mouseoutイベント)
		function resetHighlight(e) {
			// clickイベントに対応
			var clickdPrefecture = e.target.feature.properties.ObjName_1;
			if(clickdDist[clickdPrefecture]==false){

				var layer = e.target;

				layer.setStyle({
					weight: 2,
					color: 'white',
					fillOpacity: 0.7
				});
				//var geojson = L.geoJson(geojson);
				//geojson.resetStyle(e.target);

				info.update();
			}
		}

		// 折れ線追加＆ハイライト固定関数(clickイベント)
		function addLineOnChart(e) {
			// 折れ線追加
			var clickdPrefecture = e.target.feature.properties.ObjName_1;
			var newOpacity = (opacityDist[clickdPrefecture]!=0) ? 0 : 1;
			d3.select(".line__"+clickdPrefecture).style("opacity", newOpacity);
			d3.select(".text__"+clickdPrefecture).style("opacity", newOpacity);
			opacityDist[clickdPrefecture] = newOpacity;
			// ハイライト固定
			var newClick = (clickdDist[clickdPrefecture]==false) ? true : false;
			clickdDist[clickdPrefecture] = newClick;
		}

		// // ズーム関数(旧clickイベント)
		// function zoomToFeature(e) {
		// 	map.fitBounds(e.target.getBounds());
		// }

		// mouseoverイベント管理関数
		function onEachFeature(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: addLineOnChart
			});
		}

		// // resizeイベント関数
		// function resize(graphDataset) {
		//     // width幅を取得
		//     var w = window.innerWidth - margin.left - margin.right;
		//     drawLineChart(graphDataset, w);
		// }

		// 連想配列のkeyとvalueを反転させた連想配列を返す関数
		function inverseObject (obj, keyIsNumber) {
		  return Object.keys(obj).reduceRight(function (ret, k) {
		    return (ret[obj[k]] = keyIsNumber ? parseInt(k, 10) : k, ret);
		  }, {});
		}

	  });

}());