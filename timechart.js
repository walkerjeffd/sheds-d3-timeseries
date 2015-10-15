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
      area = d3.svg.area()
        .x(function (d) { return x(xAccessor(d)); })
        .y0(function (d) { return y(d.max); })
        .y1(function (d) { return y(d.min); })
        .interpolate('step-after'),
      line = d3.svg.line()
        .x(function (d) { return x(xAccessor(d)); })
        .y(function (d) { return y(yAccessor(d)); })
        .interpolate('step-after'),
      zoom = d3.behavior.zoom()
        .on('zoom', zoomed),
      data,
      showBand = true,
      svg, g, container;

  function chart (selection) {
    selection.each(function (d, i) {
      svg = d3.select(this).selectAll('svg');

      if (svg.empty()) {
        svg = d3.select(this)
          .append('svg')
            .attr('height', height + margin.top + margin.bottom)
            .attr('width', width + margin.left + margin.right)
          .append('g')
            .attr('transform', 'translate(' + margin.left + ',' +
                                              margin.top + ')');

        svg.append('clipPath')
            .attr('id', 'clip')
          .append('rect')
            .attr('x', x(0))
            .attr('y', y(1))
            .attr('width', x(1) - x(0))
            .attr('height', y(0) - y(1));

        svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')');

        svg.append('g')
          .attr('class', 'y axis');

        container = svg.append('g')
          .attr('class', 'lines')
          .attr("clip-path", "url(#clip)");

        x.domain(d3.extent(data, function (d) { return xAccessor(d); }));

        // var clip = svg.append('defs').append('clipPath')
        //     .attr('id', 'clip-0')
        //     .append('rect')
        //     .attr('id', 'clip-rect')
        //     .attr('x', '0')
        //     .attr('y', '0')
        //     .attr('width', width)
        //     .attr('height', height);

        svg.append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('class', 'pane')
          .call(zoom);

        zoom.x(x);

        // svg.selectAll('rect.overlay').call(zoom);
      }

      zoomed();
    });
  }

  function zoomed() {
    var xExtent = d3.extent(data, xAccessor);
    var distanceToEnd = x.range()[1] - x(xExtent[1]);

    var translate = [zoom.translate()[0],
                     distanceToEnd + zoom.translate()[0]];
    translate = d3.max(translate);
    translate = d3.min([translate, 0]);
    zoom.translate([translate, 0]);

    if (data) {
      console.log('zoomed');
      // x.domain(d3.extent(data, function (d) { return xAccessor(d); }));
      // d3.behavior.zoom().x(x);

      if (showBand) {
        y.domain([d3.min(data, function (d) { return d.min; }),
                  d3.max(data, function (d) { return d.max; })]);
      } else {
        y.domain(d3.extent(data, function (d) { return yAccessor(d); }));
      }

      svg.select('.x.axis')
        .call(xAxis);

      svg.select('.y.axis')
        .call(yAxis);

      var areas = container.selectAll('.area')
        .data([data]);

      areas.enter().append('path')
        .attr('class', 'area')
        .attr('fill', 'lightgray');

      areas.attr('d', area)
        .style('opacity', 1 * showBand);

      var lines = container.selectAll('.line')
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

  return chart;
}

module.exports = timeChart;
