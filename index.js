var d3 = require('d3');

var timeChart = require('./timeChart.js');
var aggregate = require('./aggregate.js');

var format = d3.time.format('%Y-%m-%d %H:%M:%S');

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
      .x(function (d) { return d.datetime; })
      .y(function (d) { return d.value; });

    var chart = timeChart()
      .data(aggregator(rows))
      .x(function (d) {
        return d.date;
      })
      .y(function (d) {
        return d.mean;
      });

    d3.select('#selMode').on('change', function () {
      var mode = d3.select(this)[0][0].value;

      if (mode === 'inst') {
        chart
          .data(rows)
          .x(function (d) { return d.datetime; })
          .y(function (d) { return d.value; });
      } else {
        chart
          .data(aggregator.by(mode).run(rows))
          .x(function (d) { return d.date; })
          .y(function (d) { return d.mean; });
      }
      render();
    });

    function render () {
      d3.select('#viz').call(chart);
    }

    render();
  });
