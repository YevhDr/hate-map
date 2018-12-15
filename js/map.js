var rect = $("#mapid")[0].getBoundingClientRect();
var width = rect.width,
    height = rect.height;


var selectedRegion;

var projection = d3.geoMercator()
    .scale(15000)
    // .rotate([-0.25, 0.25, 0])
    .center([29.5, 45.8]);


var path = d3.geoPath().projection(projection);


var map = d3.select("#mapid")
    .append("svg")
    .attr("width", width)
    .attr("height", height);


d3.json("data/map.geojson", drawMaps);




function drawMaps(geojson) {
    map.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("class", "region")
        .attr("d", path)
        .attr("fill", "lightgrey")
        .attr("fill-opacity", 0.9)
        .attr("stroke", "#222")
        .on("click", function(d) {
        $(".region").attr("fill", "lightgrey");
            $(this).attr("fill", "red");
            selectedRegion = d.properties.VARNAME_2;
            var container = d3.select("#cases");

        d3.csv("data/data.csv", function(mydata){

            drawCases(mydata, selectedRegion);

        });
    });

}


$('select').on('change', function() {
    d3.csv("data/data.csv", function(mydata){

        drawCases(mydata, selectedRegion);

    });
});







var drawCases = function(df, region) {
    var selectedType = $( "#select option:selected").val();
    var regionData = df.filter(function(d){
        if(selectedType === "") {
            return d.district === selectedRegion;
        } else {
            return d.district === selectedRegion && d.type === selectedType;
        }
    });

    $("#cases").html("");


    d3.select("#cases")
        .append("h1")
        .html(selectedRegion + " район");

    var cases = d3.select("#cases")
            .selectAll("div")
            .data(regionData)
            .enter()
            .append("div")
            .attr("class", "cases")
        ;

    cases.each(function (d) {
        d3.select(this).style("background-color", function (d) {
            if (d.level === "помірно гострий") {
                return "yellow"
            } else if (d.level === "гострий") {
                return "orange"
            } else if (d.level === "негострий") {
                return "lightgrey"
            }

        });

        d3.select(this)
            .append("p")
            .attr("class", "title")
            .text(function (d) {
                return d.summary
            });

        var indicators = d3.select(this)
            .append("div")
            .attr("id", "indicators-container");

        indicators.append("img")
            .attr("class", "indicators")
            .attr("id", "hate-speech")
            .attr("src", "img/1.png")
            .attr("title", "мова ворожнечі в статті")
            .style("opacity", function (d) {
                if (d.hatespeech === "TRUE") {
                    return 1
                } else {
                    return 0.1
                }
            });

        indicators.append("img")
            .attr("class", "indicators")
            .attr("id", "hate-speech")
            .attr("src", "img/2.png")
            .attr("title", "заклики до ворожнечі")
            .style("opacity", function (d) {
                if (d.hatespeech_call === "TRUE") {
                    return 1
                } else {
                    return 0.1
                }
            });

        indicators.append("img")
            .attr("class", "indicators")
            .attr("id", "hate-speech")
            .attr("src", "img/3.png")
            .attr("title", "мова ворочнечі в коментарях до статті")
            .style("opacity", function (d) {
                console.log(d);
                if (d.hatespeech_comments === "TRUE") {
                    return 1
                } else {
                    return 0.1
                }
            });

        indicators.append("img")
            .attr("class", "indicators")
            .attr("id", "hate-speech")
            .attr("src", "img/court.png")
            .attr("title", function (d) {
                return d.court_string
            })
            .style("opacity", function (d) {
                if (d.court_logical === "TRUE") {
                    return 1
                } else {
                    return 0.1
                }
            });

        indicators.append("img")
            .attr("class", "indicators")
            .attr("id", "hate-speech")
            .attr("src", "img/appeal.png")
            .attr("title", function (d) {
                return d.appeal
            })
            .style("opacity", function (d) {
                if (d.appeal_logical === "TRUE") {
                    return 1
                } else {
                    return 0.1
                }
            });


        d3.select(this)
            .append("p")
            .attr("class", "description")
            .attr("display", "block")
            .text(function (d) {
                return d.description
            });


        d3.select(this)
            .append("div")
            .attr("class", "links")
            .attr("display", "block")
            .html(function (d) {
                return d.links
            });
    })
};