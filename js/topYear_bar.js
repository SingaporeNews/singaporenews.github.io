
function updateBarChart(year){
  d3.csv("transposed_terms.csv", convertNumbers, function(error, data){
    bar_data = [];
    for (i=0; i<data.length; i++){
      temp_data = {};
      myrow = [];
      for (var k in data[i]){
        r = {};
        r['term'] = k;
        r['value'] = data[i][k];
        myrow.push(r);
      }
      temp_data['year'] = data[i]['headline_year']
      temp_data['values'] = myrow;
      bar_data.push(temp_data);
    }

    for (i=0; i<bar_data.length; i++){
      bar_data[i].values.sort(function(a,b){ return b.value-a.value;});
    }

    spec_data = bar_data[year].values.slice(1,11);
    bar_year = bar_data[year].year.toString();
    console.log(spec_data);

    bar_x.domain([0, d3.max(spec_data, function(d){ return d.value; })]);
    bar_y.domain(spec_data.map(function(d){ return d.term; }));

    d3.selectAll('.bar_label').remove();

    bar_svg
        .append('text')
          .attr('class', 'bar_label')
          .attr("x", width / 2)
          .attr("y", -20)
          .style("text-anchor", "middle")
          .style("font-size", "16px")
          .style("fill", "#53565A")
          .transition()
          .duration(750)
          .text(bar_year);

    bar_svg.selectAll('.bar_y.axis')
      .transition()
      .duration(2000)
      .call(bar_yAxis);

    bar_svg.selectAll('.bar_x.axis')
      .transition()
      .duration(2000)
      .call(bar_xAxis);

    bar_svg.selectAll('g.bar')
      .data(spec_data)
      .transition()
      .duration(2000)
      .attr('transform', function(d){ return 'translate(0,' + bar_y(d.term) + ')'; });

    bar_svg.selectAll('rect')
      .data(spec_data)
      .transition()
      .duration(2000)
      .attr('width', function(d){ return bar_x(d.value); })
      .attr('height', bar_y.rangeBand());

    bar_svg.selectAll('.value')
      .data(spec_data)
      .transition()
      .duration(2000)
      .attr('x', function(d){ return bar_x(d.value); })
      .attr('y', bar_y.rangeBand() / 2)
      .attr('dx', -3)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text(function(d){ return d.value; });

  });
}

function createBarChart(year){
  d3.csv("transposed_terms.csv", convertNumbers, function(error, data){
    bar_data = [];
    for (i=0; i<data.length; i++){
      temp_data = {};
      myrow = [];
      for (var k in data[i]){
        r = {};
        r['term'] = k;
        r['value'] = data[i][k];
        myrow.push(r);
      }
      temp_data['year'] = data[i]['headline_year']
      temp_data['values'] = myrow;
      bar_data.push(temp_data);
    }

    for (i=0; i<bar_data.length; i++){
      bar_data[i].values.sort(function(a,b){ return b.value-a.value;});
    }

    spec_data = bar_data[year].values.slice(1,11);
    bar_year = bar_data[year].year.toString();

    bar_x.domain([0, d3.max(spec_data, function(d){ return d.value; })]);
    bar_y.domain(spec_data.map(function(d){ return d.term; }));

    bar_svg
        .append('text')
          .attr('class', 'bar_label')
          .attr("x", width / 2)
          .attr("y", -20)
          .style("text-anchor", "middle")
          .style("font-size", "16px")
          .style("fill", "#53565A")
          .transition()
          .duration(750)
          .text(bar_year);

    bar_svg.append('g')
        .attr('class', 'bar_x axis')
        .call(bar_xAxis);

    bar_svg.append('g')
        .attr('class', 'bar_y axis')
        .call(bar_yAxis);

    var bar = bar_svg.selectAll('g.bar')
        .data(spec_data)
      .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', function(d){ return 'translate(0,' + bar_y(d.term) + ')'; });

    bar.append('rect')
        .attr('width', function(d){ return bar_x(d.value); })
        .attr('height', bar_y.rangeBand());

    bar.append('text')
        .attr('class', 'value')
        .attr('x', function(d){ return bar_x(d.value); })
        .attr('y', bar_y.rangeBand() / 2)
        .attr('dx', -3)
        .attr('dy', '.35em')
        .attr('text-anchor', 'end')
        .text(function(d){ return d.value; });

    

  });
}