/**
 * Created by yevheniia on 11.08.19.
 */
var selectedRegion;

const array = ['Ізмаїльський', 'Болградський', 'Кілійський', 'Ренійський', 'Татарбунарський', 'Березівський', 'Біляївський',
             'Білгород-Дністровський', 'Кодимський', 'Лиманський', 'Любашівський', 'Овідіопольський', 'Одеса', 'Подільський', 'Роздільнянський',
             'Савранський', 'Саратський', 'Тарутинський', 'Ширяївський'];

var $pink = "#F69291";

// $(".hide-me").on("click", function(){
//     $("#legend > h1").css("display", "none")
// });
//
// $(".show-me").on("click", function(){
//     $("#legend > h1").css("display", "block")
// });


var map = L.map('map', {minZoom: 6,  maxZoom: 10}).setView([47.5, 30.8], 7);


setTimeout(function(){ map.invalidateSize()}, 400);
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by Carto',
        minZoom: 6,
        maxZoom: 10
    }).addTo(map);


map.scrollWheelZoom.disable();
map.zoomControl.setPosition('topright');
map.attributionControl.setPosition('bottomleft');


function getColor(d) { return array.includes(d) ? $pink : 'rgba(255,255,255,0)'; }

function style(feature) {
    return {
        fillColor: getColor(feature.properties.NAME_2),
        weight: 1,
        opacity: 1,
        color: array.includes(feature.properties.NAME_2) ? '#BFA5A4' : 'rgba(255,255,255,0)',
        //color: 'black',
        //dashArray: '3',
        fillOpacity: 0.8,
        className: array.includes(feature.properties.NAME_2) ? 'show-me' : 'hide-me'
    };
}

function highlight(ob) {
    if(array.includes(ob.feature.properties.NAME_2)){
        return {
            fillColor: $pink,
            fillOpacity: 1
        };
    }

}



function whenClicked(e) {
    selectedRegion = e.target.feature.properties.NAME_2;
    var container = d3.select("#cases");
    // d3.csv("data/data_correct.csv", function (mydata) {
    d3.csv("data/data_2019.csv", function (mydata) {


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


            // drawBarChart(nest, "#bar-chart");

        mydata.sort(function(a, b){
            return b.level - a.level
        });

        drawCases(mydata, selectedRegion);
    })
}


function onEachFeature(feature, layer) {
    var polygonCenter = layer.getBounds().getCenter();

    layer.on({
        click: whenClicked
    });
    layer.on("click", function (e) {
        geojsonLayer.setStyle(style); //resets layer colors
        layer.setStyle(highlight(e.target));  //highlights selected.
        $("#legend").css("display", "block");
    });

    $("text").css("font-weight", "100");
    $("text:contains('" + feature.properties.NAME_2 + "')").css("font-weight", "800");
    }


$('select').on('change', function () {
    d3.csv("data/data_2019.csv", function (mydata) {
        console.log(selectedRegion === undefined);
        if (selectedRegion === undefined){
            alert("Оберіть район на карті")
        } else {
            drawCases(mydata, selectedRegion);

        }
    });
});





//Шар з поточними виборами
var additionalLayer = new L.LayerGroup();
var geojsonLayer = new L.GeoJSON.AJAX("data/ukr_adm2.geojson", { style: style, onEachFeature: onEachFeature } );
geojsonLayer.addTo(additionalLayer);
additionalLayer.addTo(map);
var marker;


var drawCases = function (df, region) {
    if (array.includes(region)) {

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
        $("#legend p").css("display", "block");



        d3.select("#paste-region")
            .html(function(){
                if(selectedRegion != "Одеса") {
                    return selectedRegion + " район";
                } else {
                    return selectedRegion
                }
            });



        if (regionData.length > 0) {
            var cases = d3.select("#cases-container")
                    .selectAll("div")
                    .data(regionData)
                    .enter()
                    .append("div")
                    .attr("class", "cases")

                ;

            cases.each(function (d) {
                d3.select(this)
                .on("mouseover", function (d) {
                    $(".mark").remove();
                    var popup = d.place;
                    var mark = [+d.lat, +d.lon];


                    if (marker) { // check
                        map.removeLayer(marker); // remove
                    }
                    marker = new L.Marker(mark); // set
                    marker.bindPopup(popup).openPopup();

                    marker.addTo(map);
                });


                d3.select(this).style("background-color", function (d) {
                    if (d.level === "помірно гострий") {
                        return "#FFD872"
                    } else if (d.level === "гострий") {
                        return "#FFBC84"
                    } else if (d.level === "негострий") {
                        return "white"
                    }

                });

                d3.select(this)
                    .append("p")
                    .attr("class", "date")
                    .text(function (d) {
                        return d.start
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

    }

else {
        $("#details").css("display", "none");
        $("#legend p").css("display", "none");


        d3.select("#paste-region")
            .html(selectedRegion + " район");
        $("#cases-container").html("");


        d3.select("#cases-container")
        .append("p")
        .text(function (d) {
            return "По даному району немає даних"
        });
    }
};


var types = [
    { key: "АТО", value: 0 },
    { key: "ОТГ", value: 0 },
    { key: "девіантний", value: 0 },
    { key: "земельний", value: 0 },
    { key: "міжнаціональний", value: 0 },
    { key: "реформа освіти", value: 0 },
    { key: "політичний", value: 0 },
    { key: "управлінський", value: 0 },
    { key: "реформа медицини", value: 0 },
    { key: "бізнесовий", value: 0 },
    { key: "екологічний", value: 0 },
    { key: "права людини", value: 0 },
    { key: "релігійний", value: 0 }

];
// var types = ["АТО", "ОТГ", "девіантний", "земельний", "міжнаціональний", "освіта", "політичний", "управлінський", "реформа медицини", "бізнесовий"]








function drawBarChart(df, container) {

    $(container).empty();
    $(".annotation").remove();

    df.forEach(function (d) {
        d.value = +d.value;
    });

    var margin = {top: 20, right: 20, bottom: 30, left: 0},
        width = 300 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;


    var svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleBand().range([height, 0]);

    var bar = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var yAxisDomain = [];
    var yAxisDomainKeysPre = [];

    df.forEach(function(d) {
        yAxisDomain.push(d)
    });

    df.forEach(function(d) {
        yAxisDomainKeysPre.push(d.key)
    });

    types.forEach(function(d) {
        if(!yAxisDomainKeysPre.includes(d.key)) {
            yAxisDomain.push(d)
        }
    });

    yAxisDomain.sort(function(a, b) { return a.value - b.value; });

    var yAxisDomainKeys = [];
    yAxisDomain.forEach(function(d) {
        yAxisDomainKeys.push(d.key)
    });

    x.domain([0, 14]);
    y.domain(yAxisDomainKeys);

    bar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

    bar.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    bar.selectAll(".bar")
        .data(yAxisDomain)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", 8)
        .attr("y", function(d) { return y(d.key); })
        .attr("width", function(d) { return x(d.value); })
        .attr("fill", "red");


    bar.selectAll(".text")
        .data(yAxisDomain)
        .enter().append("text")
        .attr("class", "bar-labels")
        //.attr("x", function(d) { return x(d.sales); })
        .attr("x", x(0))
        .attr("y", function (d) {
            return y(d.key) - 3;
        })
        .attr("fill", "red")
        .text(function(d) {
            console.log(d);
            return d.key + ", " + d.value;
        });


    svg.selectAll("g.tick text")
        .attr("dy", 0);


}
