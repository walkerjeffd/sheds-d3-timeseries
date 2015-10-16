'use strict';

var d3 = require('d3');

function timeChart () {
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      aggregateBy = d3.time.day.floor,
      x = d3.time.scale().range([0, width]),
      y = d3.scale.linear().range([height, 0]),
      xAxis = d3.svg.axis().scale(x).orient('bottom'),
      yAxis = d3.svg.axis().scale(y).orient('left'),
      xAccessor = function (d) { return d[0]; },
      yAccessor = function (d) { return d[1]; },
      data,
      showBand = true,
      svg, g, container,
      onZoom = function () {};

  var area = d3.svg.area()
    .x(function (d) { return x(xAccessor(d)); })
    .y0(function (d) { return y(d.max); })
    .y1(function (d) { return y(d.min); })
    .interpolate('step-after');

  var line = d3.svg.line()
    .x(function (d) { return x(xAccessor(d)); })
    .y(function (d) { return y(yAccessor(d)); })
    .interpolate('step-after');

  var zoom = d3.behavior.zoom()
    .scaleExtent([1, 80])
    .on('zoom', zoomed);

  var customTimeFormat = d3.time.format.multi([
    ['.%L', function (d) { return d.getMilliseconds(); }],
    [':%S', function (d) { return d.getSeconds(); }],
    ['%I:%M', function (d) { return d.getMinutes(); }],
    ['%I %p', function (d) { return d.getHours(); }],
    ['%b %d', function (d) { return d.getDay() && d.getDate() != 1; }],
    ['%b %d', function (d) { return d.getDate() != 1; }],
    ['%b', function (d) { return d.getMonth(); }],
    ['%Y', function () { return true; }]
  ]);
  xAxis.tickFormat(customTimeFormat).ticks(8);

  function chart (el) {
    if (el.selectAll('svg').empty()) {
      svg = el
        .append('svg')
          .attr('height', height + margin.top + margin.bottom)
          .attr('width', width + margin.left + margin.right)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' +
                                            margin.top + ')');

      svg.append('clipPath')
          .attr('id', 'clip')
        .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', width)
          .attr('height', height);

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')');

      svg.append('g')
        .attr('class', 'y axis');

      container = svg.append('g')
        .attr('class', 'data')
        .attr('clip-path', 'url(#clip)');

      container.append('g').attr('class', 'areas');
      container.append('g').attr('class', 'lines');

      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'pane')
        .call(zoom);

      x.domain(d3.extent(data, xAccessor));
      zoom.x(x);
    }

    zoomed();
  }

  function zoomed() {
    if (data) {
      var xExtent = d3.extent(data, xAccessor);

      // clamp x-axis zoom
      if (x.domain()[0] < xExtent[0]) {
        zoom.translate([zoom.translate()[0] - x(xExtent[0]) + x.range()[0],
                        zoom.translate()[1]]);
      } else if (x.domain()[1] > xExtent[1]) {
        zoom.translate([zoom.translate()[0] - x(xExtent[1]) + x.range()[1],
                        zoom.translate()[1]]);
      }

      if (showBand) {
        y.domain([d3.min(data, function (d) { return d.min; }),
                  d3.max(data, function (d) { return d.max; })]);
      } else {
        y.domain(d3.extent(data, function (d) { return yAccessor(d); }));
      }

      onZoom(x.domain());

      svg.select('.x.axis')
        .call(xAxis);

      svg.select('.y.axis')
        .call(yAxis);

      var areas = container.select('g.areas')
        .selectAll('.area')
        .data(showBand ? [data] : []);

      areas.enter().append('path')
        .attr('class', 'area')
        .attr('fill', 'lightgray');

      areas.attr('d', area);

      areas.exit().remove();

      var lines = container.select('g.lines')
        .selectAll('.line')
        .data([data]);

      lines.enter().append('path')
        .attr('class', 'line');

      lines.attr('d', line);
    }
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

  chart.showBand = function (_) {
    if (!arguments.length) {
      return showBand;
    }
    showBand = _;
    return chart;
  };

  chart.onZoom = function (_) {
    if (!arguments.length) {
      return onZoom;
    }
    onZoom = _;
    return chart;
  };

  return chart;
}

module.exports = timeChart;
