var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementById('chart'),
    width = g.clientWidth/1.1, //w.innerWidth || e.clientWidth || g.clientWidth,
    height = e.clientHeight/1.45;//w.innerHeight|| e.clientHeight|| g.clientHeight;

var margin = {top: 20, right: 20, bottom: 30, left: 140},
  width = width - margin.left - margin.right,
  height = height - margin.top - margin.bottom;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(250)
    .friction(0.9)
    .size([width, height]);

var forceSvg = d3.select("div#chord_chart").append("svg")
    .attr("width", width)
    .attr("height", height);

var forceListSvg = d3.select('div#force_list').append('svg')
    .attr('width', 200)
    .attr('height', 2000)
    .append('g')
      .attr("transform", "translate(" + margin.right + "," + margin.top + ")");

forceListSvg.append('text')
    .attr('class', 'listTitle')
    .attr('x', 50)
    .attr('y', 0 + "em")
    .style('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('fill', '#47996E')
    .text('Select a word to');

forceListSvg.append('text')
    .attr('class', 'listTitle')
    .attr('x', 50)
    .attr('y', 1 + "em")
    .style('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('fill', '#47996E')
    .text('add or remove it');

forceListSvg.append('text')
    .attr('class', 'listTitle')
    .attr('x', 50)
    .attr('y', 2 + "em")
    .style('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('fill', '#47996E')
    .text('from the graph:');

var node_drag = d3.behavior.drag()
    .on("dragstart", dragstart)
    .on("drag", dragmove)
    .on("dragend", dragend);
    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }
    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
    }
    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        force.resume();
    }
    function releasenode(d) {
        d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        //force.resume();
    };

var selectedList = [];

drawGraph(selectedList);

function drawGraph(selectedList){

  d3.csv("http://singaporenews.github.io/data/Headline_dataset/cooccurrence_matrix/cooccurrenceMatrixData.csv", function(data){

    totallist = [];
      for (i=0; i<data.length; i++){
        if ($.inArray(data[i].word1, totallist) < 0){
          totallist.push(data[i].word1);
        }
        if ($.inArray(data[i].word2, totallist) < 0){
          totallist.push(data[i].word2);
        }
      }

    data1 = $.map(data, function(element){
          return ($.inArray(element.word1,selectedList)>-1?element:null);
        });
        data = $.map(data1, function(element){
          return ($.inArray(element.word2,selectedList)>-1?element:null);
        });


        graphDict = {};
        graphDict['nodes'] = [];
        graphDict['links'] = [];
        entrylist = [];
        for (i=0; i<data.length; i++){
          if ($.inArray(data[i].word1, entrylist) < 0){
            dict = {};
            dict['name'] = data[i].word1
            dict['group'] = 0
            graphDict['nodes'].push(dict)
            entrylist.push(data[i].word1);
          };
          if ($.inArray(data[i].word2, entrylist) < 0){
            dict = {};
            dict['name'] = data[i].word2
            dict['group'] = 0
            graphDict['nodes'].push(dict)
            entrylist.push(data[i].word2);
          };
          dict = {};
          dict['source'] = entrylist.indexOf(data[i].word1);
          dict['target'] = entrylist.indexOf(data[i].word2);
          dict['value'] = +data[i].size
          graphDict['links'].push(dict);
        };

    graph = graphDict;

    var term_label = forceListSvg.selectAll('.force_item')
            .data(totallist);

    term_label
            .enter()
          .append('text')
            .attr('class', 'force_item')
            .attr("x", 50)
            .attr("y", function(d,i){ return i + 4 + "em"; })
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#53565A")
            .transition()
            .duration(750)
            //.style('fill', function(d){ return line_color(d.term); })
            .text(function(d){ return d; });

    term_label.on('click', function(d){
            if ($.inArray(d, selectedList) < 0){
              selectedList.push(d);
              drawGraph(selectedList);
              d3.select(this).style('fill', 'rgb(31, 119, 180)')
            }
            else {
              selectedList = selectedList.filter(function(e){ return e != d; });
              drawGraph(selectedList);
              d3.select(this).style('fill', 'rgb(83, 86, 90)')
            }
          });

      //data = prepData(selectedList);

        force
          .nodes(graph.nodes)
          .links(graph.links)
          .start();

        var graphMin = d3.min(graph.links, function(d){ return d.size; });
        var graphMax = d3.max(graph.links, function(d){ return d.size; });

        var fill = d3.scale.ordinal()
            .domain([graphMin, graphMax])
            .range(["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4",
              "#41ae76","#238b45","#006d2c","#00441b"]);

        var div = d3.select('div#chord_chart').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

        var link = forceSvg.selectAll(".link")
            .data(graph.links);

        link
          .enter().append("line")
            .attr("class", "link")
            //.style('stroke-width', 1)
            //.style('stroke', function(d){ return fill(d.value); })
            .style('stroke', '#47996E')
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        link.exit().remove();

        var node = forceSvg.selectAll(".node")
            .data(graph.nodes);

        node
          .enter().append("circle")
            .attr("class", "node")
            .attr("r", 10)
            //.style("fill", function(d) { return color(d.group); })
            .on('dblclick', releasenode)
            .on('click', connectedNodes)
            .call(node_drag);
            //.call(force.drag);

        node
            .on('mouseover', function(d,i,j){
                d3.select(this).transition().duration(600)
                  .attr('r', 15).style('opacity', 1);
                div.transition()
                  .duration(500)
                  .style('opacity', 1);
                div.html(d.name)
                  .style('left', '0px')
                  .style('top', '10px');
                  //.style('left', (d3.event.pageX) + 10 + "px")
                  //.style('top', (d3.event.pageY) + 2 + "px")
                  //.style('color', line_color(used_data[j].term));
            })
            .on('mouseout', function(d){
                d3.select(this).transition().duration(600)
                  .attr('r', 10).style('opacity', 1);
                div.transition()
                  .duration(500)
                  .style('opacity', 0);
            });
        node.append("title")
            .text(function(d) { return d.name; });

        node.exit().remove();

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

  });

};

function prepData(data, list){

      data1 = $.map(data, function(element){
        return ($.inArray(element.word1,list)>-1?element:null);
      });
      data = $.map(data1, function(element){
        return ($.inArray(element.word2,list)>-1?element:null);
      });


      graphDict = {};
      graphDict['nodes'] = [];
      graphDict['links'] = [];
      entrylist = [];
      for (i=0; i<data.length; i++){
        if ($.inArray(data[i].word1, entrylist) < 0){
          dict = {};
          dict['name'] = data[i].word1
          dict['group'] = 0
          graphDict['nodes'].push(dict)
          entrylist.push(data[i].word1);
        };
        if ($.inArray(data[i].word2, entrylist) < 0){
          dict = {};
          dict['name'] = data[i].word2
          dict['group'] = 0
          graphDict['nodes'].push(dict)
          entrylist.push(data[i].word2);
        };
        dict = {};
        dict['source'] = entrylist.indexOf(data[i].word1);
        dict['target'] = entrylist.indexOf(data[i].word2);
        dict['value'] = +data[i].size
        graphDict['links'].push(dict);
      };
      //return graphDict;
    };
























/*
d3.json("newsGraph.json", function(error, graph) {
  testGraph = JSON.parse(JSON.stringify(graph))

  selectedList = ['up','police','china','labor','union'];
  selectedData1 = $.map(testGraph.nodes, function(element){
      return ($.inArray(element.name,selectedList)>-1?element:null);
    });

  selectedData2 = $.map(testGraph.links, function(element){
      return ($.inArray(element['name1'],selectedList)>-1?element:null);
    });

  selectedData3 = $.map(selectedData2, function(element){
      return ($.inArray(element.name2,selectedList)>-1?element:null);
    });

  new_graph = {};
  new_graph['nodes'] = graph.nodes;
  new_graph['links'] = selectedData3;


  //drawGraph(graph, selectedData1, selectedData3);
  drawGraph(graph);




});
*/
