
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 860 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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

  var list = ['war', 'bomb', 'blast'];

  var data = $.map(data, function(element){
    return ($.inArray(element.wordCol,list)>-1?element:null)
  });

  data.forEach(function(d){
    d.countCol = +d.countCol;
    d.yearCol = +d.yearCol;
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


});  

  
  