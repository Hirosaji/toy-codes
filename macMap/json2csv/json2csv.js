// 読み込みデータファイル
var json = require( "./mac_plot.json" );
var fs = require('fs');

outputList = [];
outputList.push(
  [ "name", "address", "lat", "lng", "wifi", "allHours", "drive", "hundred", "morning", "barista", "birthday", "playRand", "adventure", "parking" ]
  )

json.forEach(function(d){
  tempList = [ d.name, d.address, d.latitude, d.longitude ];
  d.condition_values.forEach(function(e){
    tempList.push(e);
  })
  outputList.push(tempList);
})

console.log(outputList)

var formatCSV = '';

exportCSV(outputList);

// 配列をcsvで保存するfunction
function exportCSV(content){
  for (var i = 0; i < content.length; i++) {
      var value = content[i];

      for (var j = 0; j < value.length; j++) { var innerValue = value[j]===null?'':value[j].toString(); var result = innerValue.replace(/"/g, '""'); if (result.search(/("|,|\n)/g) >= 0)
      result = '"' + result + '"';
      if (j > 0)
      formatCSV += ',';
      formatCSV += result;
    }
    formatCSV += '\n';
  }
  fs.writeFile('formList.csv', formatCSV, 'utf8', function (err) {
    if (err) {
      console.log('保存できませんでした');
    } else {
      console.log('保存できました');
    }
  });
}