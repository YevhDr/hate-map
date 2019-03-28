window.screen.orientation.onchange = function(e) {
    // alert("I'was turned")
    location.reload();
}


var rect = $("#mapid")[0].getBoundingClientRect();
var width = rect.width,
    height = rect.height;
// var width = 800,
//     height = 600;


var selectedRegion;

var projection = d3.geoMercator()
    .scale(2800)
    .center([28.5, 51.15]);


var path = d3.geoPath()
    .projection(projection);

var path2 = d3.geoPath()
    .projection(projection);

var map = d3.select("#adm2");
    // .append("svg")
    // .attr("width", width)
    // .attr("height", height)
    // .attr("id", "adm2");


var map2 = d3.select("#adm1")
    // .insert("svg", "#bessarabia")
    // .attr("width", width)
    // .attr("height", height)
    // .attr("id", "adm1")
    .append("g");

var markers = map.append("g");

d3.json("data/ukr_adm1.geojson", drawUkraine);

function drawUkraine(ukraine) {

    map2.selectAll("path")
        .data(ukraine.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "transparent")
        .attr("stroke", "black")
        .attr("opacity", 0.05)

}

// d3.select("#mapid svg").append('path')
//     .attr("d", "M143,155C106,144,98,110,102,85")
//     .attr("fill", "none")
//     .attr("class", "annotation")
//     .attr("stroke", "red");
//
// d3.select("#mapid svg").append('path')
//     .attr("d", "M212,433C181,419,162,387,170,349")
//     .attr("class", "annotation")
//     .attr("fill", "none")
//     .attr("stroke", "red");
//
// d3.select("#mapid svg").append('text')
//     .attr("y", 320)
//     .attr("x", 0)
//     .attr("fill", "red")
//     .attr("font-size", "13px")
//     .attr("class", "annotation")
//     .tspans(d3.wordwrap("Оберіть один з наявних районів", 20), 20, 80);
//
// d3.select("#mapid svg").append('text')
//     .attr("y", 170)
//     .attr("x", 0)
//     .attr("fill", "red")
//     .attr("class", "annotation")
//     .attr("font-size", "13px")
//     .tspans(d3.wordwrap("Використовуйте фільтр конфліктів", 20), 20, 100);


d3.json("data/ukr_adm2.geojson", drawMaps);

function drawMaps(geojson) {

    
    map.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("class", "region")
        .attr("d", path)
        .attr("fill", function(d) {
            if(d.properties.NAME_2 === "Ізмаїльський" ||
                d.properties.NAME_2 === "Болградський" ||
                d.properties.NAME_2 === "Кілійський" ||
                d.properties.NAME_2 === "Ренійський" ||
                d.properties.NAME_2 === "Татарбунарський"){
                return "orange"
            } else {
                return "lightgrey"
            }
        })
        .attr("fill-opacity", 1)
        .attr("stroke", "#CDCDCD")
        .on("click", function (d) {

            $("#legend").css("display", "block");
            $("text").css("font-weight", "100");
            // $(this).attr("fill", "lightgrey");
            // $("text:contains('" + d.properties.VARNAME_2 + "')").css("font-weight", "800");
            // selectedRegion = d.properties.VARNAME_2;
            $("text:contains('" + d.properties.NAME_2 + "')").css("font-weight", "800");
            selectedRegion = d.properties.NAME_2;
            var container = d3.select("#cases");

            d3.csv("data/data_correct.csv", function (mydata) {

                var dataForBarchart = mydata.filter(function (d) {
                    return d.district === selectedRegion
                });


                var nest = d3.nest()
                    .key(function (d) {
                        return d.type;
                    })
                    .sortKeys(d3.ascending)
                    .rollup(function (obj) {
                        return obj.length;
                    })
                    .entries(dataForBarchart);


                drawBarChart(nest, "#bar-chart");

                // mydata.sort(function(a, b){
                //     return b.level - a.level
                // });

                drawCases(mydata, selectedRegion);

            });
        });


    // map.selectAll("text")
    //     .data(geojson.features)
    //     .enter()
    //     .append("svg:text")
    //     .text(function (d) {
    //         // return d.properties.VARNAME_2;
    //         return d.properties.ADM2_UA;
    //     })
    //     .attr("x", function (d) {
    //         return path.centroid(d)[0];
    //     })
    //     .attr("y", function (d) {
    //         // if(d.properties.VARNAME_2 === "Татарбунарський"){
    //         if(d.properties.ADM2_UA === "Татарбунарський"){
    //             return path.centroid(d)[1] - 10;
    //         } else {
    //             return path.centroid(d)[1];
    //
    //         }
    //     })
    //     .attr("text-anchor", "middle")
    //     .attr('font-size', '8pt');

}


$('select').on('change', function () {
    console.log(selectedRegion);
    d3.csv("data/data_correct.csv", function (mydata) {
        console.log(selectedRegion === undefined);
        if (selectedRegion === undefined){
            alert("Оберіть район на карті")
        } else {
            drawCases(mydata, selectedRegion);

        }




    });
});


var drawCases = function (df, region) {
    var selectedType = $("#select option:selected").val();
    var regionData = df.filter(function (d) {
        if (selectedType === "") {
            return d.district === selectedRegion;
        } else {
            return d.district === selectedRegion && d.type === selectedType;
        }
    });

    regionData = regionData.sort(function (a, b) {
        if (a.level < b.level) {
            return -1;
        }
        if (a.level > b.level) {
            return 1;
        }
        return 0;
    });


    $("#cases-container").html("");
    $("#details").css("display", "none");


    d3.select("#paste-region")
        .html(selectedRegion + " район");

    if(regionData.length > 0) {

        var cases = d3.select("#cases-container")
                .selectAll("div")
                .data(regionData)
                .enter()
                .append("div")
                .attr("class", "cases")

            ;

        cases.each(function (d) {
            d3.select(this).on("mouseover", function (d) {
                $(".mark").remove();
                d.lon = +d.lon;
                d.lat = +d.lat;

                var marks = [d.lon, d.lat];


                map.selectAll(".mark")
                    .data(marks).enter()
                    // .append("image")
                    // .attr("width", 30)
                    // .attr("height", 30)
                    .append("circle")
                    .attr("class", "mark")
                    // .attr("xlink:href", function(){
                    //     if(d.level === "помірно гострий") {
                    //         return 'img/pin_yellow.svg'
                    //     } else if(d.level === "гострий") {
                    //         return 'img/pin_orange.svg'
                    //     } else {
                    //         return 'img/pin_grey.svg'
                    //     }
                    // })
                    // .attr("xlink:href", 'img/pin_red.svg')
                    .attr("cx", function () {
                        console.log(projection(marks));
                        return projection(marks)[0];
                    })
                    .attr("cy", function () {
                        return projection(marks)[1];
                    })
                    .attr("r", 3)
                    .attr("fill", "red")

            })
                .on("mouseout", function () {
                    $(".mark").remove();
                })
            ;


            d3.select(this).style("background-color", function (d) {
                if (d.level === "помірно гострий") {
                    return "yellow"
                } else if (d.level === "гострий") {
                    return "orange"
                } else if (d.level === "негострий") {
                    return "lightyellow"
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

    } else {
        d3.select("#cases-container")
            .append("h5")
            .text("За обраним типом конліктів в районі не зафіксовано")
            .style("color", "white")
    }

};


function drawBarChart(df, container) {

    $(container).empty();
    $(".annotation").remove();


    var margin = {top: 20, right: 20, bottom: 30, left: 150},
        width = 300 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;


    var y = d3.scaleBand()
        .range([height, 0]);

    var x = d3.scaleLinear()
        .range([0, width]);


    var svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    df.forEach(function (d) {
        d.value = +d.value;
    });

    x.domain([0, 14]);

    // y.domain(df.map(function (d) {
    //     return d.key;
    // }));

    y.domain(["бізнесовий", "управлінський",
        "політичний", "екологічний", "ОТГ", "земельний",
        "міжнаціональний", "АТО", "реформа медицини", "девіантний"]);


    svg.selectAll(".bar")
        .data(df)
        .enter().append("rect")
        .attr("class", "bar")
        //.attr("x", function(d) { return x(d.sales); })
        .attr("width", function (d) {
            return x(d.value);
        })
        .attr("y", function (d) {
            return y(d.key);
        })
        .attr("height", 10)
        .attr("fill", "red");

// add the x Axis
//     svg.append("g")
//         .attr("transform", "translate(0," + height + ")")
//         .call(d3.axisBottom(x));

// add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("g.tick text")
        .attr("dy", 0);

};



