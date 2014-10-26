
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 860 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var tooltip = d3.select("div#chart")
    .append("div")
    .attr("class", "remove")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden")
    .style("top", "30px")
    .style("left", "55px");

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

d3.csv('Words_allyears_26oct.csv', function(error, data){

  console.log(data);

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
  console.log(summed_data);

  //var list = ['war', 'bomb', 'blast'];
  var list = [];
  for (i=0; i<20; i++){
    list.push(summed_data[i].key);
  }

  var data = $.map(data, function(element){
    return ($.inArray(element.wordCol,list)>-1?element:null)
  });

  function complete(x, key){
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
  complete(data, list);

  data.sort(function(a,b){ return a.yearCol - b.yearCol; });

  var nest = d3.nest()
    .key(function(d){ return d.wordCol; })
    .entries(data);



  var layers = stack(nest);

  x.domain(d3.extent(data, function(d){ return d.yearCol; }));
  y.domain([0, d3.max(data, function(d){ return d.y0 + d.y; })]);

  svg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d, i) { return color(i); });

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
      .duration(250)
      .attr("opacity", function(d, j) {
        return j != i ? 0.6 : 1;
    })})
    .on("mousemove", function(d, i) {
      mousex = d3.mouse(this);
      mousex = mousex[0];
      var invertedx = x.invert(mousex);
      console.log(invertedx);
      //invertedx = invertedx.getMonth() + invertedx.getDate();
      var selected = (d.values);
      for (var k = 0; k < selected.length; k++) {
        datearray[k] = selected[k].yearCol;
      }

      mousedate = datearray.indexOf(Math.round(invertedx));
      pro = d.values[mousedate].countCol;

      d3.select(this)
      .classed("hover", true)
      .attr("stroke", strokecolor)
      .attr("stroke-width", "0.5px"), 
      tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "visible");
      
    })
    .on("mouseout", function(d, i) {
     svg.selectAll(".layer")
      .transition()
      .duration(250)
      .attr("opacity", "1");
      d3.select(this)
      .classed("hover", false)
      .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "hidden");
  });

});  

  
  