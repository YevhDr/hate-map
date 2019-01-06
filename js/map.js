var rect = $("#mapid")[0].getBoundingClientRect();
var width = rect.width,
    height = rect.height;


var selectedRegion;

var projection = d3.geoMercator()
    .scale(15000)
    // .rotate([-0.25, 0.25, 0])
    .center([29.2, 46.0]);


var path = d3.geoPath()
    .projection(projection);

var path2 = d3.geoPath()
    .projection(projection);

var map = d3.select("#mapid")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "bessarabia");

var map2 = d3.select("#mapid")
    .insert("svg", "#bessarabia")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "ukraine");

var markers = map.append("g");

d3.json("data/ukr_shape.geojson", drawUkraine);

function drawUkraine(ukraine) {
    map2.selectAll("path")
        .data(ukraine.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#F3F3F3")
        .attr("opacity", 0.05)

}


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
        .attr("stroke", "#1d1d1d")
        .on("click", function(d) {
            $("#legend").css("display", "block");
            $("text").css("font-weight", "100");
            // $(this).attr("fill", "lightgrey");
           $( "text:contains('"+ d.properties.VARNAME_2 +"')" ).css( "font-weight", "800" );
            selectedRegion = d.properties.VARNAME_2;
            var container = d3.select("#cases");

        d3.csv("data/data.csv", function(mydata){

            drawCases(mydata, selectedRegion);

        });
    });


    map.selectAll("text")
        .data(geojson.features)
        .enter()
        .append("svg:text")
        .text(function(d){
            return d.properties.VARNAME_2;
        })
        .attr("x", function(d){
            return path.centroid(d)[0];
        })
        .attr("y", function(d){
            return  path.centroid(d)[1];
        })
        .attr("text-anchor","middle")
        .attr('font-size','8pt');

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

    $("#cases-container").html("");
    $("#details").css("display", "none");


    d3.select("#paste-region")
        .html(selectedRegion + " район");

    var cases = d3.select("#cases-container")
            .selectAll("div")
            .data(regionData)
            .enter()
            .append("div")
            .attr("class", "cases")

        ;

    cases.each(function (d) {
        d3.select(this).on("mouseover", function(d) {
            $(".mark").remove();
            d.lon = +d.lon;
            d.lat = + d.lat;

            var marks  = [d.lon, d.lat];

            if(d.level === "помірно гострий"){

            map.selectAll(".mark")
                .data(marks).enter()
                .append("image")
                .attr("width", 30)
                .attr("height", 30)
                .attr("class", "mark")
                .attr("xlink:href",'img/pin.svg')
                .attr("x", function () {
                    console.log(projection(marks));
                    return projection(marks)[0]; })
                .attr("y", function () {
                    return projection(marks)[1];
                })
                .attr("fill", "blue")
            }

        })
            .on("mouseout", function() {
            $(".mark").remove();
        })
        ;




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