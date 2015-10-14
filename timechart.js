'use strict';

var d3 = require('d3');

function timeChart () {
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960,
      height = 500,
      aggregateBy = d3.time.day.floor,
      x = d3.time.scale().range([0, width - margin.left - margin.right]),
      y = d3.scale.linear().range([height - margin.top - margin.bottom, 0]),
      xAxis = d3.svg.axis().scale(x).orient('bottom'),
      yAxis = d3.svg.axis().scale(y).orient('left'),
      xAccessor = function (d) { return d[0]; },
      yAccessor = function (d) { return d[1]; },
      data,
      svg, g;

  function chart (selection) {
    selection.each(function (d, i) {
      var line = d3.svg.line()
          .x(function (d) { return x(xAccessor(d)); })
          .y(function (d) { return y(yAccessor(d)); })
          .interpolate('step-after');

      svg = d3.select(this).selectAll('svg');

      if (svg.empty()) {
        svg = d3.select(this).append('svg')
          .attr('height', height)
          .attr('width', width);

        g = svg.append('g')
          .attr('transform', 'translate(' + margin.left + ',' +
                                            margin.top + ')');
        svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(' + margin.left + ',' + (height - margin.bottom) + ')');

        svg.append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
      }

      if (data) {
        x.domain(d3.extent(data, function (d) { return xAccessor(d); }));
        y.domain(d3.extent(data, function (d) { return yAccessor(d); }));

        svg.select('.x.axis')
          .call(xAxis);

        svg.select('.y.axis')
          .call(yAxis);

        var lines = g.selectAll('path')
          .data([data]);

        lines.enter().append('path')
          .attr('class', 'line');

        lines.attr('d', line);
      }
    });
  }

  chart.width = function (_) {
    if (!arguments.length) {
      return width;
    }
    width = _;
    return chart;
  };

  chart.height = function (_) {
    if (!arguments.length) {
      return height;
    }
    height = _;
    return chart;
  };

  chart.x = function (_) {
    if (!arguments.length) {
      return xAccessor;
    }
    xAccessor = _;
    return chart;
  };

  chart.y = function (_) {
    if (!arguments.length) {
      return yAccessor;
    }
    yAccessor = _;
    return chart;
  };

  chart.data = function (_) {
    if (!arguments.length) {
      return data;
    }
    data = _;
    return chart;
  };

  return chart;
}

module.exports = timeChart;
