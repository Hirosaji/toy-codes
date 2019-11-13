(function () {
    chrome.runtime.onMessage.addListener(function (req, _, _) {
        const data = JSON.parse(req);

        const target = data.contents.target;
        const width = data.contents.width;
        const height = data.contents.height;

        const s = d3.select(target);

        const sHTML = [s.html()].slice()[0];
        const tClass = s.attr("class");
        const tId = s.attr("id");

        s.html("");

        s.attr("class", "__blank__")
            .attr("id", "__blank__");

        s.append("div")
            .attr("class", tClass)
            .attr("id", tId)
            .html(sHTML);

        s
            .attr("width", width)
            .attr("height", height)
            .style("max-width", width + "px")
            .style("width", width + "px")
            .style("max-height", height + "px")
            .style("height", height + "px");

        s.select(target)
            .attr("width", width)
            .attr("height", height)
            .style("max-width", width + "px")
            .style("width", width + "px")
            .style("max-height", height + "px")
            .style("height", height + "px");

        s.select(target)
            .select("svg")
            .attr("width", width)
            .attr("height", height)
            .style("max-width", width + "px")
            .style("width", width + "px")
            .style("max-height", height + "px")
            .style("height", height + "px");

        // console.log(target, width, height);

        window.dispatchEvent(new Event("resize"));

        return true;
    });
})();
