// 読み込みデータファイル
var DATA_FILE_PATH = './data/allGuestsData.txt';
handlingTSV();

// tsvファイルを操作する
function handlingTSV() {

    var outputJSON = {};
    var yearList = ["2011", "2012", "2013", "2014", "2015", "2016", "2017"]

    d3.tsv(DATA_FILE_PATH)
      .mimeType('text/tsv; charset=shift_jis')
      .on('load', function (data) {

        data.forEach(function(column){

            outputJSON[column["都道府県"]] = {};

            yearList.forEach(function(year){
                outputJSON[column["都道府県"]][year] = {};
            });

            Object.keys(column).forEach(function(key){
                var thisMonth = key%12==0 ? 12 : key%12;
                var thisYear = yearList[Math.floor((key-1)/12)];
                if(!isNaN(thisMonth)) {outputJSON[column["都道府県"]][thisYear][thisMonth] = column[key];}
            });

        });

        console.log(outputJSON)

        // JSON出力
        var data = JSON.stringify(outputJSON);
        var a = document.createElement('a');
        a.textContent = 'export';
        a.download = 'outputJSON.json';
        a.href = window.URL.createObjectURL(new Blob([data], { type: 'text/plain' }));
        a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');

        var exportLink = document.getElementById('export-link');
        exportLink.appendChild(a);

    }).get();

};