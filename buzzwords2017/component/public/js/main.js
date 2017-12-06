// グラフサイズの設定
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// 日付情報の解析
var parseDate = d3.timeParse("%Y/%m/%d");

// rangeの設定
var xScale = d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

// SVGオブジェクトの設定
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right + 300)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tipBox, tipBoxRect, tipBoxText, tipBoxText1, tipBoxText2, tipBoxText3, tipBoxText4, tipBoxText5;

// データの取得
d3.csv("../data/data.csv", function(error, dataSet) {
  if (error) throw error;

  var wordList = [];
  for(var key in dataSet[0]){
    if(key != "週") wordList.push(key);
  };

  // check boxタグを追加するid属性の要素を取得
  var checkboxTarget = document.getElementById("wrapper");
  var checkboxText = "";

  wordList.forEach(function(selectedWord, i){

    // check boxタグの生成
    checkboxText = checkboxText + '<label>'
      + '<input type="checkbox" class="checkbox" id="word' + String(i+1)
      + '" value="word' + String(i+1) + '" checked > ' + selectedWord
      + '<span id="word' + String(i+1) + '">■ </span></label>';
    if(i!==0 && (i+1)%5==0){ checkboxText = checkboxText + '<br>'; };

    // データの整形
    dataSet.forEach(function(d) {
        d.date = parseDate(d["週"]);
        d.word = +d[selectedWord];
    });

    // Scaleの設定
    xScale.domain(d3.extent(dataSet, function(d) { return d.date; }));
    yScale.domain([0, 100]);

    // Lineの定義
    var valueline = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.word); })
        .curve(d3.curveLinear);

    // Line Pathの設定
    svg.append("path")
        .attr("class", "line")
        .attr("id", "word"+(i+1))
        .attr("d", valueline(dataSet));

  })

  // X axisの追加
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

  // Y axisの追加
  svg.append("g")
      .call(d3.axisLeft(yScale));

  // check boxタグの配置
  checkboxText = checkboxText + '<br>'
    + '<label><input type="checkbox" class="checkbox" id="allCheck" value="allCheck" checked > '
    + '全てを選択・解除' + '</label>';
  checkboxTarget.innerHTML = checkboxText;

  // Tooltipの設定
  var focus = svg.append('g')
    .attr('class', 'focus')
    .style('display', 'none');

  focus.append('line')
    .attr('class', 'x-hover-line hover-line')
    .attr('y1' , 0)
    .attr('y2', height);

  svg.append('rect')
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("mousemove", mousemove);

  tipBox = svg.append("g");

  tipBoxRect = tipBox
    .append('rect')
    .attr('width', 275)
    .attr('height', 200)
    .attr('opacity', 0)
    .style("fill", "gray");

  tipBoxText = tipBox.append("text").attr('opacity', 0);
  tipBoxText1 = tipBox.append("text").attr('opacity', 0);
  tipBoxText2 = tipBox.append("text").attr('opacity', 0);
  tipBoxText3 = tipBox.append("text").attr('opacity', 0);
  tipBoxText4 = tipBox.append("text").attr('opacity', 0);
  tipBoxText5 = tipBox.append("text").attr('opacity', 0);
  tipBoxValue1 = tipBox.append("text").attr('opacity', 0);
  tipBoxValue2 = tipBox.append("text").attr('opacity', 0);
  tipBoxValue3 = tipBox.append("text").attr('opacity', 0);
  tipBoxValue4 = tipBox.append("text").attr('opacity', 0);
  tipBoxValue5 = tipBox.append("text").attr('opacity', 0);

  var timeScales = dataSet.map(function(d) { return xScale(d.date); });

  // mouseoverイベント関数
  function mouseover() {
    focus.style("display", null);
    d3.selectAll('.points text').style("display", null);
    tipBoxRect.attr('opacity', 0.5);
    tipBoxText.attr('opacity', 1);
    tipBoxText1.attr('opacity', 1);
    tipBoxText2.attr('opacity', 1);
    tipBoxText3.attr('opacity', 1);
    tipBoxText4.attr('opacity', 1);
    tipBoxText5.attr('opacity', 1);
    tipBoxValue1.attr('opacity', 1);
    tipBoxValue2.attr('opacity', 1);
    tipBoxValue3.attr('opacity', 1);
    tipBoxValue4.attr('opacity', 1);
    tipBoxValue5.attr('opacity', 1);
  }
  function mouseout() {
    focus.style("display", "none");
    d3.selectAll('.points text').style("display", "none");
    tipBoxRect.attr('opacity', 0);
    tipBoxText.attr('opacity', 0);
    tipBoxText1.attr('opacity', 0);
    tipBoxText2.attr('opacity', 0);
    tipBoxText3.attr('opacity', 0);
    tipBoxText4.attr('opacity', 0);
    tipBoxText5.attr('opacity', 0);
    tipBoxValue1.attr('opacity', 0);
    tipBoxValue2.attr('opacity', 0);
    tipBoxValue3.attr('opacity', 0);
    tipBoxValue4.attr('opacity', 0);
    tipBoxValue5.attr('opacity', 0);
  }
  function mousemove() {
    var i = d3.bisect(timeScales, d3.mouse(this)[0], 1);
    var di = dataSet[i];

    var keyList = [];
    for(var key in di){ if(key!="週" && key!="date" && key!="word") keyList.push({ "key":key, "value":Number(di[key]) }) };
    keyList.sort(function(a,b){
      if(a.value > b.value) return -1;
      if(a.value < b.value) return 1;
      return 0;
    });

    focus.attr("transform", "translate(" + xScale(di.date) + ",0)");
    d3.selectAll('.points text')
      .attr('x', function(d) { return xScale(di.date) + 15; })
      .attr('y', function(d) { return yScale(d.values[i-1].total); })
      .text(function(d) { return d.values[i-1].total; })
      .style('fill', function(d) { return z(d.name); });
    tipBoxRect
      .attr('x', d3.event.pageX - 25)
      .attr('y', d3.event.pageY - 220);
    tipBoxText
      .attr('x', d3.event.pageX - 5)
      .attr('y', d3.event.pageY - 190)
      .style("color", "black")
      .style("font-weight", "bold")
      .text('"'+di['週']+'" までの１週間');
    tipBoxText1.attr('x', d3.event.pageX).attr('y', d3.event.pageY - 157).text(keyList[0].key);
    tipBoxText2.attr('x', d3.event.pageX).attr('y', d3.event.pageY - 127).text(keyList[1].key);
    tipBoxText3.attr('x', d3.event.pageX).attr('y', d3.event.pageY - 97).text(keyList[2].key);
    tipBoxText4.attr('x', d3.event.pageX).attr('y', d3.event.pageY - 67).text(keyList[3].key);
    tipBoxText5.attr('x', d3.event.pageX).attr('y', d3.event.pageY - 37).text(keyList[4].key);
    tipBoxValue1.attr('x', d3.event.pageX + 200).attr('y', d3.event.pageY - 157).text(keyList[0].value);
    tipBoxValue2.attr('x', d3.event.pageX + 200).attr('y', d3.event.pageY - 127).text(keyList[1].value);
    tipBoxValue3.attr('x', d3.event.pageX + 200).attr('y', d3.event.pageY - 97).text(keyList[2].value);
    tipBoxValue4.attr('x', d3.event.pageX + 200).attr('y', d3.event.pageY - 67).text(keyList[3].value);
    tipBoxValue5.attr('x', d3.event.pageX + 200).attr('y', d3.event.pageY - 37).text(keyList[4].value);
  }


});