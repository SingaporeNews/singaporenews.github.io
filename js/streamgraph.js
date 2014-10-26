
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

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv('Words_allyears_26oct.csv', function(error, data){

  var list = ['war', 'bomb', 'blast'];

  var data = $.map(data, function(element){
    return ($.inArray(element.wordCol,list)>-1?element:null)
  });

  data.forEach(function(d){
    d.countCol = +d.countCol;
    d.yearCol = +d.yearCol;
  });

  console.log(data);

  

  function complete(x){
    counter = 0;
    yearsPresent = []
    years = [];
    for (i=1955; i<2010; i++){
      years.push(i)
      for (j=0; j<x.length; j++){
        if (x[j].yearCol === i){
          counter += 1;
          yearsPresent.push(i);
        }
      }
    }
    for (i=0; i<years.length; i++){
      if (yearsPresent.indexOf(years[i]) < 0){
        dict = {}
        dict['countCol'] = 0;
        dict['wordCol'] = x[0].wordCol;
        dict['yearCol'] = years[i];
        data.push(dict);
      }
    }
    //return data;
  };

  

  complete(data.filter(function(d){ return d.wordCol == 'war'; }));

  console.log(data);

  /*
  

  data = d3.nest()
            .key(function(d){ return d.wordCol; })
            .entries(data);
  */


})  

  
  