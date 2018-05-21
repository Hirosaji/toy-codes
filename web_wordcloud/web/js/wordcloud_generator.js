function post_userID_for_tweets(user_id){

	var rest_api_url = 'https://f81eece0.ngrok.io';

	fetch(rest_api_url, {
	    method: 'POST',
	    headers: {
	        'Accept': 'application/json',
	        'Content-Type': 'application/json'
	    },
	    id: user_id,
	}).then(function (res) {
	    return res.json();
	}).then(function (json) {
	    generate_wordcloud(json.body);
	});

}

function generate_wordcloud(words_freq){

	var width = 800;
	var height = 800;

	var data = words_freq.splice(0, 1000);
	var random = d3.randomUniform(2);

	var countMax = d3.max(data, function(d){ return d[0]; });
	var sizeScale = d3.scaleLinear().domain([0, countMax]).range([10, 100]);
	var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

	var words = data.map(function(d) {
		return {
			text: d[1],
			size: sizeScale(d[0])
		};
	});

	d3.layout.cloud().size([width, height])
		.words(words)
		.rotate(function() { return Math.round(1-random()) *90; })
		.font("Impact")
		.fontSize(function(d) { return d.size; })
		.on("end", draw)
		.start();

	function draw(words) {
		d3.select("#wordcloud")
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(150,150)")
			.selectAll("text")
			.data(words)
			.enter()
			.append("text")
			.style("font-family", "Impact")
			.style("font-size", function(d) { return d.size + "px"; })
			.style("fill", function(d, i) { return colorScale(i); })
			.attr("text-anchor", "middle")
			.attr("transform", function(d) {
				return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
			})
			.text(function(d) { return d.text; });
	}

}

var user_id = '812938399250165760';  // HirosajiのTwitterID
post_userID_for_tweets(user_id);