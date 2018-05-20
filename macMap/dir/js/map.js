// csvの読み込み
d3.csv('../data/formatData.csv')
  .mimeType('text/csv; charset=shift_jis')
  .on('load', function (data) {

	// 背景地図の設定
	var mymap = L.map('mapid').setView([35.6811673, 139.7670516], 12);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox.streets',
	    accessToken: 'Your_access_token',
	}).addTo(mymap);

	// 駅マーカーの設定
	data.forEach(function(val) {
		var stationsMaker = L.marker(
			[val.lat, val.lng]
			).addTo(mymap);

		var popupComment = val.name;
		stationsMaker.bindPopup(popupComment);
	});

  })
  .get();