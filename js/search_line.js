
var search_list = [];
var datearray = [];


function showHeadlines(){

  //if tempdata = x.filter(function(d){ return d.wordCol == key[i]; });
  d3.csv("http://singaporenews.github.io/Words_story_headlines_27oct.csv", function(error, data){
    list = [];
    theLength = d3.selectAll('.term_label')[0].length;
    for (i=0; i<theLength; i++){
      list.push(d3.selectAll('.term_label')[0][i].innerHTML);
    }

    /* 
    data = $.map(data, function(element){
      return ($.inArray(element.wordCol,list)>-1?element:null)
    });
    */

    console.log(data);

    var headline = line_svg.selectAll('headline')
        .data(data[0])
        .enter()
      .append('text')
        .attr('class', 'term_label')
        .attr("x", (width/3)*2)
        .attr("y", 0)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#53565A")
        .transition()
        .duration(1000)
        .text(function(d){ return d.yearCol + ": " + d.headlineCol; });


  })
}

function updateData(frm){
  search_list.push(frm.toLowerCase());
  d3.csv("http://singaporenews.github.io/transposed_terms_27oct.csv", function(error, data){
    
    line_color.domain(d3.keys(
      data[0]).filter(function(key){ return key.toLowerCase() !== 'headline_year'; }
      )
    );

    var headline_terms = line_color.domain().map(function(term){
      return {
        term: term.toLowerCase(),
        values: data.map(function(d){
          return {year: d.headline_year, count: +d[term]};
        })
      };
    });

    
    if (search_list.length > 5){
      length = search_list.length;
      search_list = search_list.slice(-5);
    };
    
    used_data = $.map(headline_terms, function(element){
      return ($.inArray(element.term,search_list)>-1?element:null)
    });

    line_color.domain(search_list);

    
    //used_data = headline_terms.filter(function(d){ return d.term == frm; });

    var xAxis = d3.svg.axis()
      .scale(line_x)
      .orient("bottom")
      .ticks(used_data[0].values.map(function(d){ return d.year; }));

    var yAxis = d3.svg.axis()
      .scale(line_y)
      .orient('left');

    var minY = d3.min(used_data, function(c){ return d3.min(c.values, function(v){
                  return v.count; });
                });

    var maxY = d3.max(used_data, function(c){ return d3.max(c.values, function(v){
                  return v.count; });
                });

    line_x.domain(used_data[0].values.map(function(d){ return d.year; }));

    line_y.domain([minY, maxY]);

    var term_label = line_svg.selectAll('.term_label')
        .data(used_data);

    term_label
        .enter()
      .append('text')
        .attr('class', 'term_label');

        /*
        .transition()
        .duration(750)
        .attr('class', 'term_label')
        .attr("x", -60)
        .attr("y", function(d,i){ return i+"em"; })
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .transition()
        .duration(750)
        .style('fill', function(d){ return color(d.term); })
        .text(function(d){ return d.term; });
      */
    term_label
        .transition()
        .duration(750)
        .attr("x", -70)
        .attr("y", function(d,i){ return i+"em"; })
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .transition()
        .duration(750)
        .style('fill', function(d){ return line_color(d.term); })
        .text(function(d){ return d.term; });

    term_label.exit().transition().duration(750).remove();

    line_svg.selectAll('.line_y.axis')
      .transition()
      .duration(750)
      .call(yAxis);

    var terms = line_svg.selectAll('.terms');

    var termsLines = terms.selectAll('.line')
        .data(used_data);

    termsLines.enter().append('path')
        .transition()
        .duration(750)
        .attr('class', 'line')
        .attr('d', function(d){ return line(d.values); })
        .style('stroke', function(d){ return line_color(d.term); });

    termsLines.exit().transition().duration(750).remove();

    termsLines
      .transition()
      .duration(750)
      .attr('class', 'line')
      .attr('d', function(d){ return line(d.values); })
      .style('stroke', function(d){ return line_color(d.term); });

  });
};

function createChart(frm){
  search_list.push(frm);
  d3.csv("http://singaporenews.github.io/transposed_terms_27oct.csv", function(error, data){
    console.log(data);
    line_color.domain(d3.keys(
      data[0]).filter(function(key){ return key.toLowerCase() !== 'headline_year'; }
      )
    );

    var headline_terms = line_color.domain().map(function(term){
      return {
        term: term.toLowerCase(),
        values: data.map(function(d){
          return {year: d.headline_year, count: +d[term]};
        })
      };
    });

    used_data = headline_terms.filter(function(d){ return d.term == frm.toLowerCase(); });

    var xAxis = d3.svg.axis()
      .scale(line_x)
      .orient("bottom")
      .ticks(used_data[0].values.map(function(d){ return d.year; }));

    var yAxis = d3.svg.axis()
      .scale(line_y)
      .orient('left');

    var minY = d3.min(used_data, function(c){ return d3.min(c.values, function(v){
                  return v.count; });
                });

    var maxY = d3.max(used_data, function(c){ return d3.max(c.values, function(v){
                  return v.count; });
                });

    line_x.domain(used_data[0].values.map(function(d){ return d.year; }));

    line_y.domain([minY, maxY]);

    var term_label = line_svg.selectAll('term_label')
        .data(used_data)
        .enter()
      .append('text')
        .attr('class', 'term_label')
        .attr("x", -70)
        .attr("y", function(d,i){ return i+"em"; })
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#53565A")
        .transition()
        .duration(750)
        .style('fill', function(d){ return line_color(d.term); })
        .text(function(d){ return d.term; });

    line_svg.append('g')
        .attr('class', 'line_x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', function(d){
              return 'rotate(-65)'
            });

    line_svg.append('g')
        .attr('class', 'line_y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Count');

    var terms = line_svg.append('g')
              .attr('class', 'terms');

    var termsLines = terms.selectAll('.line')
        .data(used_data);

    termsLines.enter().append('path')
        .attr('class', 'line');

    termsLines.exit().remove();

    termsLines
      .attr('d', function(d){ return line(d.values); })
      .style('stroke', function(d){ return line_color(d.term); });
  });


}