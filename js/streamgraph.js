
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category20();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var area = d3.svg.area()
    .x(function(d) { return x(d.yearCol); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

var stack = d3.layout.stack()
    .values(function(d) { return d.values; });

var svg = d3.select("div#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv('Words_allyears_26oct.csv', function(error, data){

  var list = ['war', 'bomb', 'blast'];
  color.domain(list);

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

  var words = stack(color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {yearCol: d.yearCol, y: d.countCol };
      })
    };
  }));

  x.domain(d3.extent(data, function(d){ return d.yearCol; }));

  var word = svg.selectAll('.word')
      .data(words)
    .enter().append('g')
      .attr('class', 'word');

  word.append('path')
      .attr('class', 'area')
      .attr('d', function(d){ return area(d.values); })
      .style('fill', function(d){ return color(d.name); });

  word.append('text')
    .datum(function(d){ return {name: d.name, value: d.values[d.values.length - 1]}; })
    .attr('transform', function(d){ return "translate(" + x(d.value.yearCol) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
    .attr('x', -6)
    .attr('dy', '.35em')
    .text(function(d){ return d.name; });

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);
  /*
  data = d3.nest()
            .key(function(d){ return d.wordCol; })
            .entries(data);
  */


});  

  
  