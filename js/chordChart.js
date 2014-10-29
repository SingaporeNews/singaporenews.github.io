// Chart dimensions.
var w = 480,
    h = 500,
    r1 = Math.min(w, h) / 2 - 4,
    r0 = r1 - 20;

// Square matrices, asynchronously loaded; words1 is the transpose of words2.
var words2 = [],
    words1 = [];

// The chord layout, for computing the angles of chords and groups.
var layout = d3.layout.chord()
    .sortGroups(d3.descending)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)
    .padding(.04);

var chordColor = d3.scale.category20();

// The color scale, for different categories of "worrisome" size.
var fill = d3.scale.ordinal()
    .domain([0, 1, 2])
    .range(["#DB704D", "#D2D0C6", "#ECD08D", "#F8EDD3"]);

// The arc generator, for the groups.
var arc = d3.svg.arc()
    .innerRadius(r0)
    .outerRadius(r1);

// The chord generator (quadratic Bézier), for the chords.
var chord = d3.svg.chord()
    .radius(r0);

// Add an SVG element for each diagram, and translate the origin to the center.
var chordSvg = d3.select("div#chord_chart").selectAll("div")
    .data([words2, words1])
  .enter().append("div")
    .style("display", "inline-block")
    .style("width", w + "px")
    .style("height", h + "px")
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

// Load our data file…
d3.csv("cooccurrenceMatrixData.csv", function(data) {

  selectedList = ['strike','workers','red','reds','talks','talk','jobs']

  selectedData1 = $.map(data, function(element){
      return ($.inArray(element.word1,selectedList)>-1?element:null);
    });
  data = $.map(selectedData1, function(element){
      return ($.inArray(element.word2,selectedList)>-1?element:null);
    });
  //data = selectedData1.concat(selectedData2)
  //data = data.filter(function(d){ return d.size > 300; });

  var words = {},
      array = [],
      n = 0;

  // Compute a unique id for each word.
  data.forEach(function(d) {
    d.word1 = word(d.word1);
    d.word2 = word(d.word2);
    //d.word2.size = d.size;
    d.valueOf = value; // convert object to number implicitly
  });

  // Initialize a square matrix of words2 and words1.
  for (var i = 0; i < n; i++) {
    words2[i] = [];
    words1[i] = [];
    for (var j = 0; j < n; j++) {
      words2[i][j] = 0;
      words1[i][j] = 0;
    }
  }

  // Populate the matrices, and stash a map from id to word.
  data.forEach(function(d) {
    words2[d.word1.id][d.word2.id] = d;
    words1[d.word2.id][d.word1.id] = d;
    array[d.word1.id] = d.word1;
    array[d.word2.id] = d.word2;
  });

  // For each diagram…
  chordSvg.each(function(matrix, j) {
    var chordSvg = d3.select(this);

    // Compute the chord layout.
    layout.matrix(matrix);

    // Add chords.
    chordSvg.selectAll("path.chord")
        .data(layout.chords)
      .enter().append("svg:path")
        .attr("class", "chord")
        .style("fill", function(d) { return chordColor(d.source.value.word1.name) })
        .style("stroke", function(d) { return '#000'; })
        .attr("d", chord)
      .append("svg:title")
        .text(function(d) { return d.source.value.word2.name + " owes " + d.source.value.word1.name + " $" + d.source.value + "B."; });

    // Add groups.
    var g = chordSvg.selectAll("g.group")
        .data(layout.groups)
      .enter().append("svg:g")
        .attr("class", "group");

    // Add the group arc.
    g.append("svg:path")
        .style("fill", function(d) { return chordColor(d.source.value.word1.name); })
        .attr("id", function(d, i) { return "group" + d.index + "-" + j; })
        .attr("d", arc)
      .append("svg:title")
        .text(function(d) { return array[d.index].name + " " + (j ? "owes" : "is owed") + " $" + d.value + "B."; });

    // Add the group label (but only for large groups, where it will fit).
    // An alternative labeling mechanism would be nice for the small groups.
    g.append("svg:text")
        .attr("x", 6)
        .attr("dy", 15)
        .filter(function(d) { return d.value > 110; })
      .append("svg:textPath")
        .attr("xlink:href", function(d) { return "#group" + d.index + "-" + j; })
        .text(function(d) { return array[d.index].name; });
  });

  // Memoize the specified word, computing a unique id.
  function word(d) {
    return words[d] || (words[d] = {
      name: d,
      id: n++
    });
  }

  // Converts a debit object to its primitive numeric value.
  function value() {
    return +this.size;
  }
});