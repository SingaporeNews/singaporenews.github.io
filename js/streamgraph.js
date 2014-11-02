
drawStackedChart(10);

$(document).on('click', '#top_num li a', function () {
    if ($.trim($('#start-group').text()) == "Start year"){
      var start_year = 1955;
    } else {
      var start_year = parseFloat(
        $('#start-group').text().substr($('#start-group').text().length - 4));
    }
    if ($.trim($('#end-group').text()) == "End year"){
      var end_year = 2010;
    } else {
      var end_year = parseFloat(
        $('#end-group').text().substr($('#end-group').text().length - 4));
    }
    updateStackedChart(($(this).text()), start_year, end_year);
});

function capitaliseFirstLetter(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function selectiveReplacement(string){
  dict = {'pm':'PM', 'us':'US'};
  for (key in dict){
    if (string === key){
      string = dict[key];
      return capitaliseFirstLetter(string);
    }
    else {
      return capitaliseFirstLetter(string);
    }
  }
}

/*
$(document).on('click', '#start_year li a', function () {
    if ($.trim($('#words-group').text()) == "# of top words"){
      var terms_num = 10;
    } else {
      var terms_num = parseFloat(
        $('#words-group').text().substr($('#words-group').text().length - 2));
    }
    if ($.trim($('#end-group').text()) == "End year"){
      var end_year = 2010;
    } else {
      var end_year = parseFloat(
        $('#end-group').text().substr($('#end-group').text().length - 4));
    }
    var start_year = parseFloat(
        $('#start-group').text().substr($('#start-group').text().length - 4));
    updateStackedChart(terms_num, start_year, end_year);
});
$(document).on('click', '#end_year li a', function () {
    if ($.trim($('#words-group').text()) == "# of top words"){
      var terms_num = 10;
    } else {
      var terms_num = parseFloat(
        $('#words-group').text().substr($('#words-group').text().length - 2));
    }
    if ($.trim($('#start-group').text()) == "Start year"){
      var start_year = 1955;
    } else {
      var start_year = parseFloat(
        $('#start-group').text().substr($('#start-group').text().length - 4));
    }
    var end_year = parseFloat(
        $('#end-group').text().substr($('#end-group').text().length - 4));
    updateStackedChart(terms_num, start_year, end_year);
});
*/

$(function(){
    $("#top_num li a").click(function(){
      $("#words-group:first-child").text("# of top words: " + $(this).text());
      $("#words-group:first-child").val($(this).text());
   });
});
$(function(){
    $("#start_year li a").click(function(){
      $("#start-group:first-child").text("Start year: " + $(this).text());
      $("#start-group:first-child").val($(this).text());
   });
});
$(function(){
    $("#end_year li a").click(function(){
      $("#end-group:first-child").text("End year: " + $(this).text());
      $("#end-group:first-child").val($(this).text());
   });
});

var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementById('chart'),
    width = g.clientWidth/1.1, //w.innerWidth || e.clientWidth || g.clientWidth,
    height = e.clientHeight/1.45;//w.innerHeight|| e.clientHeight|| g.clientHeight;

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;
/*
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 860 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
*/

var tooltip = d3.select("div#stream_label")
    .append("div")
    .attr("class", "remove")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden")
    .style("top", "0px")
    .style("left", "0px")
    .style("font-size", "25px");

var datearray = [];

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category20();

var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(d3.format('d'))
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var stack = d3.layout.stack()
  .offset('zero')
  .values(function(d){ return d.values; })
  .x(function(d){ return d.yearCol; })
  .y(function(d){ return d.countCol; });


var area = d3.svg.area()
    .interpolate('basis')
    .x(function(d) { return x(d.yearCol); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

var svg = d3.select("div#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawStackedChart(word_num){

  d3.csv('http://singaporenews.github.io/data/Words_allyears_27oct.csv', function(error, data){

    data.forEach(function(d){
      d.countCol = +d.countCol;
      d.yearCol = +d.yearCol;
    });

    var summed_data = d3.nest()
                        .key(function(d){ return d.wordCol; })
                        .rollup(function(leaves){ 
                            return {"total": d3.sum(
                              leaves, function(d){ return d.countCol; })}})
                        .entries(data);
    summed_data.sort(function(a,b){ return b.values.total - a.values.total; });

    var list = [];
    for (i=0; i<word_num; i++){
      list.push(summed_data[i].key);
    }

    var data = $.map(data, function(element){
      return ($.inArray(element.wordCol,list)>-1?element:null)
    });

    complete(data, list, data);

    data.sort(function(a,b){ return a.yearCol - b.yearCol; });

    var nest = d3.nest()
      .key(function(d){ return d.wordCol; })
      .entries(data);

    var layers = stack(nest);

    x.domain(d3.extent(data, function(d){ return d.yearCol; }));
    y.domain([0, d3.max(data, function(d){ return d.y0 + d.y; })]);

    var chartLayers = svg.selectAll(".layer")
        .data(layers);

    chartLayers
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return color(i); });

    chartLayers
        .transition()
        .duration(550)
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return color(i); });

    chartLayers
        .exit()
        .transition()
        .duration(550)
        .remove();

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function(d, i) {
        svg.selectAll(".layer").transition()
        .duration(550)
        .attr("opacity", function(d, j) {
          return j != i ? 1 : 1;
      })})
      .on("mousemove", function(d, i) {
        mousex = d3.mouse(this);
        mousex = mousex[0];
        var invertedx = x.invert(mousex);
        //invertedx = invertedx.getMonth() + invertedx.getDate();
        var selected = (d.values);
        for (var k = 0; k < selected.length; k++) {
          datearray[k] = selected[k].yearCol;
        }

        mousedate = datearray.indexOf(Math.round(invertedx));
        pro = d.values[mousedate].countCol;
        tip_year = d.values[mousedate].yearCol;

        d3.select(this)
        .classed("hover", true)
        .attr("stroke", 'black')
        .attr("stroke-width", "1.5px"), 
        tooltip.html( "<p>" + selectiveReplacement(d.key) + " | " + tip_year + ": " + pro + "</p>" )
          .style("visibility", "visible")
          .style('fill', function(d){ return color[i]; });
        
      })
      .on("mouseout", function(d, i) {
       svg.selectAll(".layer")
        .transition()
        .duration(250)
        .attr("opacity", "1");
        d3.select(this)
        .classed("hover", false)
        .attr("stroke-width", "0px"), 
        tooltip.html( "<p>" + selectiveReplacement(d.key) + "<br>" + pro + "</p>" )
          .style("visibility", "hidden")
          .style('fill', 'rgb(83, 86, 90)');
    });

  });  
}

function updateStackedChart(word_num, start, end){

  d3.csv('http://singaporenews.github.io/data/Words_allyears_27oct.csv', function(error, data){

    data.forEach(function(d){
      d.countCol = +d.countCol;
      d.yearCol = +d.yearCol;
    });

    var summed_data = d3.nest()
                        .key(function(d){ return d.wordCol; })
                        .rollup(function(leaves){ 
                            return {"total": d3.sum(
                              leaves, function(d){ return d.countCol; })}})
                        .entries(data);
    summed_data.sort(function(a,b){ return b.values.total - a.values.total; });

    var list = [];
    for (i=0; i<word_num; i++){
      list.push(summed_data[i].key);
    }

    var data = $.map(data, function(element){
      return ($.inArray(element.wordCol,list)>-1?element:null)
    });

    complete(data, list, data);

    var year_list = [];
    for (i=start; i<end+1; i++){
      year_list.push(i);
    };

    data = $.map(data, function(element){
      return ($.inArray(element.yearCol, year_list) > -1 ? element:null)
    });

    data.sort(function(a,b){ return a.yearCol - b.yearCol; });

    var nest = d3.nest()
      .key(function(d){ return d.wordCol; })
      .entries(data);

    var layers = stack(nest);

    x.domain(d3.extent(data, function(d){ return d.yearCol; }));
    y.domain([0, d3.max(data, function(d){ return d.y0 + d.y; })]);

    var chartLayers = svg.selectAll(".layer")
        .data(layers);

    chartLayers
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return color(i); });

    chartLayers
        .transition()
        .duration(550)
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return color(i); });

    chartLayers
        .exit()
        .transition()
        .duration(550)
        .remove();

    svg.selectAll('.x.axis')
        .transition()
        .duration(550)
        .call(xAxis);

    svg.selectAll('.y.axis')
        .transition()
        .duration(550)
        .call(yAxis);

    svg.selectAll(".layer")
      .attr("opacity", 1)
      /*
      .on("mouseover", function(d, i) {
        svg.selectAll(".layer").transition()
        .duration(250)
        .attr("opacity", function(d, j) {
          return j != i ? 0.6 : 1;
      })})
      */
      .on("mousemove", function(d, i) {
        mousex = d3.mouse(this);
        mousex = mousex[0];
        var invertedx = x.invert(mousex);
        //invertedx = invertedx.getMonth() + invertedx.getDate();
        var selected = (d.values);
        for (var k = 0; k < selected.length; k++) {
          datearray[k] = selected[k].yearCol;
        }

        mousedate = datearray.indexOf(Math.round(invertedx));
        pro = d.values[mousedate].countCol;
        tip_year = d.values[mousedate].yearCol;

        d3.select(this)
        .classed("hover", true)
        .attr("stroke", 'black')
        .attr("stroke-width", "1.5px"), 
        tooltip.html( "<p>" + selectiveReplacement(d.key) + " | " + tip_year + ": " + pro + "</p>" )
          .style("visibility", "visible")
          .style('fill', function(d){ return color(d.key); });
        
      })
      .on("mouseout", function(d, i) {
       svg.selectAll(".layer")
        .transition()
        .duration(550)
        .attr("opacity", "1");
        d3.select(this)
        .classed("hover", false)
        .attr("stroke-width", "0px"), 
        tooltip.html( "<p>" + selectiveReplacement(d.key) + "<br>" + pro + "</p>" )
          .style("visibility", "hidden")
          .style('fill', 'rgb(83, 86, 90)');
    });
  });  
}


function complete(x, key, data){
  for (i=0; i<key.length; i++){
    tempdata = x.filter(function(d){ return d.wordCol == key[i]; });
    yearsPresent = []
    years = [];

    for (year=1955; year<2010; year++){
      years.push(year)
      for (row=0; row<tempdata.length; row++){
        if (tempdata[row].yearCol === year){
          yearsPresent.push(year);
        }
      }
    }
    
    for (year=0; year<years.length; year++){
      if (yearsPresent.indexOf(years[year]) < 0){
        dict = {}
        dict['countCol'] = 0;
        dict['wordCol'] = tempdata[0].wordCol;
        dict['yearCol'] = years[year];
        data.push(dict);
      }
    }
  }
  
};
  