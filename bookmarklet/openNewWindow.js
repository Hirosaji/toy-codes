javascript:!function(undefined){
	// Get URL Info
	getUrlInfo = function () {
		var text = document.getElementsByClassName('UNIQUE_CLASSNAME')[0].textContent;
	    return text;
	};

	// Open New Window <- Get URL Info
	window.open(getUrlInfo());
}();