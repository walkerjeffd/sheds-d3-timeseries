var d3 = require('d3');

var format = d3.time.format("%Y-%m-%d %H:%M:%S");

var modes = {
  'day': d3.time.day.floor,
  'month': d3.time.month.floor
};

var mode = 'day';

d3.csv('/public/data/data.csv')
  .row(function (d) {
    return {
      datetime: format.parse(d.datetime),
      value: +d.value
    };
  })
  .get(function (error, rows) {
    var chart = timeChart()
      .data(rows)
      .aggregateBy(modes[mode]);

    d3.select('#btnMode').on('click', function () {
      if (mode === 'day') {
        mode = 'month';
      } else {
        mode = 'day';
      }
      d3.select('#viz').call(chart.aggregateBy(modes[mode]));
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
      rawData,
      data,
      svg, g;

  function chart (selection) {
    selection.each(function (d, i) {
      y.domain(d3.extent(data, function (d) { return d.mean; }));
      x.domain(d3.extent(data, function (d) { return d.date; }));

      var line = d3.svg.line()
          .x(function (d) { return x(d.date); })
          .y(function (d) { return y(d.mean); });

      svg = d3.select(this).selectAll('svg');

      if (svg.empty()) {
        svg = d3.select(this).append('svg')
          .attr('height', height)
          .attr('width', width);
        g = svg.append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      }

      if (data) {
        console.log('data');
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

  chart.data = function (_) {
    if (!arguments.length) {
      return data;
    }
    rawData = _;
    data = aggregate(rawData, aggregateBy);
    return chart;
  };

  chart.aggregateBy = function (_) {
    if (!arguments.length) {
      return aggregateBy;
    }
    aggregateBy = _;
    data = aggregate(rawData, aggregateBy);
    return chart;
  };

  return chart;
}

function aggregate (data, by) {
  var nested = d3.nest()
      .key(function (d) { return by(d.datetime); })
      .rollup(function (items) {
        return {
          n: items.length,
          max: d3.max(items, function (d) { return d.value; }),
          min: d3.min(items, function (d) { return d.value; }),
          mean: d3.mean(items, function (d) { return d.value; })
        };
      })
      .entries(data);

  return nested.map(function (d) {
    var obj = d.values;
    obj.date = new Date(d.key)
    return obj;
  });
}
