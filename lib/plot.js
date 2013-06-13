(function () {

  "use strict";

  window.Chart = function () {

    var x = function (d) { return d[0]; },
        y = function (d) { return d[1]; },
        width = 750, height = 300,
        margin = {top: 30, right: 80, bottom: 30, left: 70},
        padding = 10,
        nbins = 45;

    var chart = function (selection) {
      selection.each(function (data) {

        var svg = d3.select(this).selectAll("svg").data([data]);
        svg.enter().append("svg")
              .attr("width", width)
              .attr("height", height)
            .append("g")
              .attr("class", "lineplot")
              .attr("transform", "translate("+margin.left+","
                                 +margin.top+")");

        var el = svg.select(".lineplot");

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

        // Bin/compute stats on the data.
        var hist = [], bins = [], i, db = (ylim[1]-ylim[0])/nbins, norm,
            mean = 0.0, variance;
        for (i = 0; i < nbins+1; ++i) {
          if (i < nbins) hist.push(0);
          bins.push(ylim[0]+i*db);
        }
        data.map(function (el) {
          var ind = Math.floor((el.flux-ylim[0])/db);
          if (ind >= nbins) ind = nbins - 1;
          hist[ind] += 1;
          mean += el.flux;
        });
        mean /= data.length;
        variance = data.reduce(function (v, d) {
          var del = d.flux-mean;
          return v+del*del;
        }, 0.0);
        variance /= data.length;
        norm = hist.reduce(function (v, d, i) {
          return v+d*(bins[i+1]-bins[i]);
        }, 0);
        hist = hist.map(function (d) { return d/norm; });

        // Plot the side histogram.
        var rng = [0, d3.max(hist)];
        var histscale = d3.scale.linear().domain(rng)
                          .range([0, margin.right-padding]),
            binscale = d3.scale.linear()
                          .domain(ylim)
                          .range([height-margin.top-margin.bottom, 0]);
        var histel = svg.selectAll(".hist").data([hist]);
        histel.enter().append("g").attr("class", "hist")
              .attr("transform", "translate("+(width-margin.right+padding)+","
                    +margin.top+")");
        var bars = histel.selectAll(".bar").data(hist);
        bars.enter().append("rect").attr("class", "bar");
        bars.attr("x", 0)
            .attr("width", function (d) { return histscale(d); })
            .attr("y", function (d, i) { return binscale(bins[i+1]); })
            .attr("height", function (d, i) {
              return binscale(bins[i]) - binscale(bins[i+1]);
            });

        // Plot the Gaussian fit.
        var ng = 1000, xs=[], ys, dx=(ylim[1]-ylim[0])/(ng-1),
            val = 1/Math.sqrt(2*Math.PI*variance);
        for (i = 0; i < ng; ++i) xs.push(ylim[0]+dx*i);
        ys = xs.map(function (x0) {
          var del = x0-mean;
          return val*Math.exp(-0.5*del*del/variance);
        });

        var gaussline = d3.svg.line()
                          .x(function (d) { return histscale(d); })
                          .y(function (d, i) { return binscale(xs[i]); }),
            linel = histel.append("path").attr("d", gaussline(ys))
                          .attr("class", "gaussline");

        histel.exit().remove();
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

    chart.padding = function (value) {
      if (!arguments.length) return padding;
      padding = value;
      return chart;
    };

    chart.nbins = function (value) {
      if (!arguments.length) return nbins;
      nbins = value;
      return chart;
    };

    return chart;
  }

})();
