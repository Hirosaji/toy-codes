// HTML出力
var outHtml = function(ttl, bdy) {
	$('<h1>').text(ttl).appendTo('body');
	$('<pre>').text(bdy).appendTo('body');
};

/** HM Lab文字 **/
console.log('Hirosaji🍙');

// オブジェクトの生成
var cc = new CharCanvas(180, 27, '-');

// 文字領域の設定
var mask = cc.areaText(6, 1, '©Hirosaji', 20, 'Arial', 0.85, 1.7);
cc.fillArea(mask, '#');

// おにぎりマークの設定
// △ (輪郭部分)
var x = 0;
var ln = cc
    .moveTo(x + 160, 3)
    .lineTo(x + 145, 18)
    .lineTo(x + 175, 18)
    .close();
cc.fillArea(ln, '@');
// ■ (海苔部分)
cc.fillFnc('areaRect', ['&'], 154, 12, 13, 7);

// 注意書き
cc.drawTextZ(61, 25, '※当HPの内容について、私的使用又は引用等著作権法上認められた行為を除き、Hirosajiに無断に転載等を行うことはできません。');

// コンソールに描画
cc.print();

// HTMLに描画
outHtml('Hirosaji🍙アスキーアート', cc.toString());