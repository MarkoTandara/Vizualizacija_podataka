(function () {
    var margin = { top: 500, left: 50, right: 50, bottom: 50 },
        height = 800 - margin.top - margin.bottom,
        width = 1400 - margin.left - margin.right,
        chartWidth = 700 - margin.left - margin.right,
        chartHeight = 400 - 30 - margin.bottom;;


    const tooltip = d3.tip()
        .attr("class", "tooltip");

    var svg = d3.select("#map")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + 900 + "," + (margin.top + 600) + ")")
        .call(tooltip);


    var chart = d3.select("#map")
        .append("svg")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + 50 + margin.bottom)
        .attr("transform", "translate(" + 1100 + "," + -400 + ")")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 0 + ")");


    var x = d3.scaleBand()
        .range([0, chartWidth])
        .padding(0.2);
    var xAxis = chart.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")

    var y = d3.scaleLinear()
        .range([chartHeight, 0]);
    var yAxis = chart.append("g")
        .attr("class", "myYaxis")


    function LastYears(){
        var result = [];
        for (var i = 5; i < 16; i++) {
            var d
            if(i<10){
                d='200' + i
            }
            else{
                d = '20' + i
            }
            result.push(d)
        }
        return (result);
    }

    d3.queue()
        .defer(d3.json, "us_states.topojson")
        .defer(d3.csv, "Dataset/Names_by_state.csv")
        .await(ready)

    var projection = d3.geoMercator()
        .translate([width / 2, -height / 2])
        .scale(500)

    var path = d3.geoPath()
        .projection(projection)

    function ready(error, data2, freq) {

        
        var states = topojson.feature(data2, data2.objects.us_states).features

        var years = LastYears()
        console.log(years)
        var frequentNames = []

        freq.forEach(element => {
            frequentNames.push(element)
        });
        console.log(frequentNames)


        states.forEach(element => {
            element.properties.frequentNamesValue = []
            element.properties.frequentNames = []
            frequentNames.forEach(e => {
                if (e.statecode == element.properties.name) 
                { 
                    element.properties.frequentNamesValue.push(parseInt(e.value))
                    element.properties.frequentNames.push(e.name)
                }
            });

        });
        console.log(states)


        function updateChart(name_values, names) {
            x.domain(years)
            xAxis.transition().duration(2000).call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-5,25)rotate(-40)")

            var bindedData = [];

            for (var i = 0; i < 11; i++) {
                bindedData[i] = {
                    name_values: name_values[i],
                    days: years[i],
                    name: names[i]
                };
            }
            console.log(bindedData)


            y.domain([0, d3.max(name_values)]);
            yAxis.transition().duration(1000).call(d3.axisLeft(y));

            var u = chart.selectAll("rect")
                .data(bindedData)

            maxValue = d3.max(bindedData, d => d.name_values)
            increment = maxValue / 6

            const colorScaleGraph = d3.scaleThreshold()
                .domain([0, increment, increment * 2, increment * 3, increment * 4, increment * 5, maxValue])
                .range(d3.schemePuBu[9]);

            
            u
                .enter()
                .append("rect")
                .merge(u)
                .transition()
                .duration(1000)
                .attr("x", function (d) {
                    return x(d.days);
                })
                .attr("y", function (d) { return y(d.name_values); })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return chartHeight - y(d.name_values); })
                .attr("fill", function (d) {
                    return colorScaleGraph(d.name_values);
                });

            svg.selectAll("rect")
                .data(names)
                .enter()
                .append("text")
                .text(function(d) {
                    console.log(d)
                    return d;
                })
                .attr("x", function (d) {
                    console.log(d.days)
                    return x(d.days);
                })
                .attr("y", function (d) { return y(d.name_values)+20; });
            
            
        }
        var mouseOver = function (d) {
            d3.select(event.target).style("opacity", 0.5);

            tooltip.html((d) => {
                return `${d.properties.name}`
            });
            tooltip.show(d, event.target);

        }

        let mouseLeave = function (d) {
            tooltip.hide()
            d3.select(event.target).style("opacity", 1);
        };

        svg.selectAll(".state")
            .data(states)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path)
            .on('mouseover', mouseOver)
            .on('mouseleave', mouseLeave)
            .on('click', (d) => updateChart(d.properties.frequentNamesValue,d.properties.frequentNames))
    }
})();