javascript:!function(undefined){
	var global = window;

	global.COPY_TO_CLIPBOARD = global.COPY_TO_CLIPBOARD || {}

	// Get Text Info
	global.COPY_TO_CLIPBOARD.getTextInfo = function () {
		var text = document.getElementsByClassName('UNIQUE_CLASSNAME')[0].textContent;
	    return text;
	};

	// Copy to Clipboard <- Get Text Info
	global.COPY_TO_CLIPBOARD.copyToClipboard = function() {
	    var copyFrom = document.createElement("textarea");
	    copyFrom.textContent = this.getTextInfo();

	    var bodyElm = document.getElementsByTagName("body")[0];
	    bodyElm.appendChild(copyFrom);
	    copyFrom.select();

	    var retVal = document.execCommand('copy');
	    bodyElm.removeChild(copyFrom);
	    return retVal;
	};

	global.COPY_TO_CLIPBOARD.copyToClipboard();
}();