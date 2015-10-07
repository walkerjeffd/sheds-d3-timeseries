var d3 = require('d3');

var format = d3.time.format("%Y-%m-%d %H:%M:%S");

d3.csv('/public/data/data.csv')
  .row(function (d) {
    return {
      datetime: format.parse(d.datetime),
      value: +d.value
    };
  })
  .get(function (error, rows) {
    var aggregator = aggregate()
      .by('day')
      .data(rows);

    var chart = timeChart()
      .data(aggregator.output())
      .xAccessor(function (d) {
        return d.date;
      })
      .yAccessor(function (d) {
        return d.mean;
      });

    d3.select('#selMode').on('change', function () {
      var mode = d3.select(this)[0][0].value;

      if (mode === 'inst') {
        chart.data(rows)
          .xAccessor(function (d) { return d.datetime; })
          .yAccessor(function (d) { return d.value; });
      } else {
        chart.data(aggregator.by(mode).output())
          .xAccessor(function (d) { return d.date; })
          .yAccessor(function (d) { return d.mean; });
      }
      d3.select('#viz').call(chart);
    });

    d3.select('#viz').call(chart);
  });

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
          .y(function (d) { return y(yAccessor(d)); });

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

  chart.xAccessor = function (_) {
    if (!arguments.length) {
      return xAccessor;
    }
    xAccessor = _;
    return chart;
  };

  chart.yAccessor = function (_) {
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

function aggregate () {
  var data = [],
      by = 'day',
      x = function (d) { return d.datetime; },
      y = function (d) { return d.value; };

  var modes = {
    'day': d3.time.day.floor,
    'month': d3.time.month.floor
  };

  function fun () {

  }

  fun.by = function (_) {
    if (!arguments.length) {
      return by;
    }
    by = _;
    return fun;
  };

  fun.data = function (_) {
    if (!arguments.length) {
      return data;
    }
    data = _;
    return fun;
  };

  fun.output = function () {
    var nested = d3.nest()
      .key(function (d) { return modes[by](x(d)); })
      .rollup(function (items) {
        return {
          n: items.length,
          max: d3.max(items, y),
          min: d3.min(items, y),
          mean: d3.mean(items, y)
        };
      })
      .entries(data);

    return nested.map(function (d) {
      var obj = d.values;
      obj.date = new Date(d.key);
      return obj;
    });
  };

  return fun;
}
