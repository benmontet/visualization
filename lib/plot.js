(function () {

  "use strict";

  window.Chart = function () {

    var x = function (d) { return d[0]; },
        y = function (d) { return d[1]; },
        width = 600, height = 300,
        margin = {top: 30, right: 30, bottom: 30, left: 70};

    var chart = function (selection) {
      selection.each(function (data) {

        var svg = d3.select(this).selectAll("svg").data([data]);
        svg.enter().append("svg")
              .attr("width", width)
              .attr("height", height)
            .append("g")
              .attr("transform", "translate("+margin.left+","
                                 +margin.top+")");

        var el = svg.select("g");

        // Compute the data limits.
        var xlim = d3.extent(data, x),
            ylim = d3.extent(data, y);

        // Set up scales and axes.
        var xscale = d3.scale.linear()
                             .domain(xlim)
                             .range([0, width-margin.left-margin.right]),
            yscale = d3.scale.linear()
                             .domain(ylim)
                             .range([height-margin.top-margin.bottom, 0]),
            xaxis = d3.svg.axis().scale(xscale),
            yaxis = d3.svg.axis().scale(yscale).orient("left");

        // Set up DOM elements for axes.
        var axes = el.selectAll(".axis").data([
            {name: "x", axis: xaxis,
             transform: "translate(0,"+yscale.range()[0]+")"},
            {name: "y", axis: yaxis, transform: "translate(0,0)"},
          ]);
        axes.enter().append("g");
        axes.attr("class", function (d) { return d.name+" axis"; })
            .attr("transform", function (d) { return d.transform; })
            .each(function (d) {
              d3.select(this).call(d.axis);
            });

        // Plot the data.
        var points = el.selectAll(".datapoint").data(data);
        points.enter().append("circle");
        points.attr("class", "datapoint")
              .attr("cx", function (d) { return xscale(d.kbjd); })
              .attr("cy", function (d) { return yscale(d.flux); })
              .attr("r", 2.0);
        points.exit().remove();

        svg.exit().remove();

      });
    };

    chart.x = function (value) {
      if (!arguments.length) return x;
      x = value;
      return chart;
    };

    chart.y = function (value) {
      if (!arguments.length) return y;
      y = value;
      return chart;
    };

    chart.xlim = function (value) {
      if (!arguments.length) return xlim;
      xlim = value;
      return chart;
    };

    chart.ylim = function (value) {
      if (!arguments.length) return ylim;
      ylim = value;
      return chart;
    };

    chart.width = function (value) {
      if (!arguments.length) return width;
      width = value;
      return chart;
    };

    chart.height = function (value) {
      if (!arguments.length) return height;
      height = value;
      return chart;
    };

    chart.margin = function (value) {
      if (!arguments.length) return margin;
      margin = value;
      return chart;
    };

    return chart;
  }

})();
