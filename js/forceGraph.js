var width = 960,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(200)
    .size([width, height]);

var forceSvg = d3.select("div#chord_chart").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("newsGraph.json", function(error, graph) {
  testGraph = JSON.parse(JSON.stringify(graph))
  console.log(testGraph);

  selectedList = [0,10,2,3,4,50,60,75,18];
  selectedData1 = $.map(testGraph.nodes, function(element){
      return ($.inArray(element.id,selectedList)>-1?element:null);
    });
  finalData = {};
  finalData['nodes'] = selectedData1;
  finalData['links'] = testGraph.links;
  selectedData2 = $.map(finalData.links, function(element){
      return ($.inArray(element.source,selectedList)>-1?element:null);
    });
  console.log(selectedData2);

  selectedData3 = $.map(selectedData2, function(element){
      return ($.inArray(element.target,selectedList)>-1?element:null);
    });
  selectedData3 = selectedData3.filter(function(d){ return d.source != "undefined"; });
  console.log(selectedData3);
  new_graph = {};
  new_graph['nodes'] = selectedData1;
  new_graph['links'] = selectedData3;
  
  
  console.log(new_graph);
  drawGraph(new_graph);

  function drawGraph(graph){
    force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

    var graphMin = d3.min(graph.links, function(d){ return d.size; });
    var graphMax = d3.max(graph.links, function(d){ return d.size; });

    var fill = d3.scale.ordinal()
        .domain([graphMin, graphMax])
        .range(["#DB704D", "#D2D0C6", "#ECD08D", "#F8EDD3"]);

    var link = forceSvg.selectAll(".link")
        .data(graph.links)
      .enter().append("line")
        .attr("class", "link")
        .style('stroke-width', 1)
        .style('stroke', function(d){ return fill(d.value); })
        //.style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = forceSvg.selectAll(".node")
        .data(graph.nodes)
      .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .style("fill", function(d) { return color(d.group); })
        .call(force.drag);

    node.append("title")
        .text(function(d) { return d.name; });

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
  }

});
    



