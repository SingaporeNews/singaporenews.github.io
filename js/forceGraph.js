var width = 960,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(250)
    .size([width, height]);

safety = 0;
while(force.alpha() > 0.05) {
  force.tick();
  if(safety++ > 500){
    break;
  }
}
if(safety < 500){
  console.log('success');
}

var forceSvg = d3.select("div#chord_chart").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("newsGraph.json", function(error, graph) {
  testGraph = JSON.parse(JSON.stringify(graph))
  console.log(graph);
  console.log(testGraph);

  selectedList = ['up','police','china','labor','union'];
  selectedData1 = $.map(testGraph.nodes, function(element){
      return ($.inArray(element.name,selectedList)>-1?element:null);
    });
  
  selectedData2 = $.map(testGraph.links, function(element){
      return ($.inArray(element['name1'],selectedList)>-1?element:null);
    });
  console.log(selectedData2);

  selectedData3 = $.map(selectedData2, function(element){
      return ($.inArray(element.name2,selectedList)>-1?element:null);
    });
  
  new_graph = {};
  new_graph['nodes'] = graph.nodes;
  new_graph['links'] = selectedData3;
  
  
  console.log(new_graph);
  drawGraph(graph, selectedData1, selectedData3);

  function drawGraph(graph, nodes, links){
    console.log(nodes);
    force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

    var graphMin = d3.min(graph.links, function(d){ return d.size; });
    var graphMax = d3.max(graph.links, function(d){ return d.size; });

    var fill = d3.scale.ordinal()
        .domain([graphMin, graphMax])
        .range(["#DB704D", "#D2D0C6", "#ECD08D", "#F8EDD3"]);

    var div = d3.select('div#chord_chart').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

    var link = forceSvg.selectAll(".link")
        .data(graph.links)
      .enter().append("line")
        .attr("class", "link")
        .style('stroke-width', 1)
        .style('stroke', function(d){ return fill(d.value); });
        //.style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = forceSvg.selectAll(".node")
        .data(graph.nodes)
      .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .style("fill", function(d) { return color(d.group); })
        .call(force.drag)
        .on('dblclick', connectedNodes);

    node
        .on('mouseover', function(d,i,j){
            d3.select(this).transition().duration(600)
              .attr('r', 8).style('opacity', 1);
            div.transition()
              .duration(500)
              .style('opacity', 1);
            div.html(d.name)
              .style('left', '300px')
              .style('top', '10px');
              //.style('left', (d3.event.pageX) + 10 + "px")
              //.style('top', (d3.event.pageY) + 2 + "px")
              //.style('color', line_color(used_data[j].term));
        })
        .on('mouseout', function(d){
            d3.select(this).transition().duration(600)
              .attr('r', 5).style('opacity', 1);
            div.transition()
              .duration(500)
              .style('opacity', 0);
        });

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

    //Toggle stores whether the highlighting is on
  var toggle = 0;

  //Create an array logging what is connected to what
  var linkedByIndex = {};
  for (i = 0; i < graph.nodes.length; i++) {
      linkedByIndex[i + "," + i] = 1;
  };
  graph.links.forEach(function (d) {
      linkedByIndex[d.source.index + "," + d.target.index] = 1;
  });

  //This function looks up whether a pair are neighbours  
  function neighboring(a, b) {
      return linkedByIndex[a.index + "," + b.index];
  }

  function connectedNodes() {

    if (toggle == 0) {
        //Reduce the opacity of all but the neighbouring nodes
        d = d3.select(this).node().__data__;
        node.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });
        
        link.style("opacity", function (o) {
            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
        });
        
        //Reduce the op
        
        toggle = 1;
    } else {
        //Put them back to opacity=1
        node.style("opacity", 1);
        link.style("opacity", 1);
        toggle = 0;
    }

}
  }


});
    



