'use strict';

var d3 = require('d3');

var timeChart = require('./timeChart.js');
var aggregate = require('./aggregate.js');

var format = d3.time.format('%Y-%m-%d %H:%M:%S');

var mode;

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
      .showBand(true)
      .x(function (d) {
        return d.date;
      })
      .y(function (d) {
        return d.mean;
      })
      .data(aggregator(rows))
      .onZoom(function (xDomain) {
        var duration = (xDomain[1] - xDomain[0]) / 86400000;
        if (duration > 6 * 30) {
          mode = 'month';
          chart
            .data(aggregator.by('month').run(rows))
            .showBand(true)
            .x(function (d) { return d.date; })
            .y(function (d) { return d.mean; });
        } else if (duration > 14) {
          mode = 'day';
          chart
            .data(aggregator.by('day').run(rows))
            .showBand(true)
            .x(function (d) { return d.date; })
            .y(function (d) { return d.mean; });
        } else {
          mode = 'instantaneous';
          chart
            .data(rows)
            .showBand(false)
            .x(function (d) { return d.datetime; })
            .y(function (d) { return d.value; });
        }
        d3.select('#agg-level').text(mode);
      });

    function render () {
      d3.select('#viz').call(chart);
    }

    render();
  });
