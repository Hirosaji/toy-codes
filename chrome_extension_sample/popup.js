
(function () {
    function sendToContents() {
        var t = document.getElementById("target").value;
        var w = document.getElementById("width").value;
        var h = document.getElementById("height").value;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id,
                JSON.stringify({ contents: { "target": t, "width": w, "height": h } }),
                function (response) {
                });
        });
    }

    d3.select("#btn").on("click", sendToContents);
})();
