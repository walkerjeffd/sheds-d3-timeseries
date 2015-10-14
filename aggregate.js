'use strict';

var d3 = require('d3');

function aggregate () {
  var by = 'day',
      x = function (d) { return d[0]; },
      y = function (d) { return d[1]; };

  var modes = {
    'day': d3.time.day.floor,
    'month': d3.time.month.floor
  };

  function agg (data) {
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
  }

  agg.by = function (_) {
    if (!arguments.length) {
      return by;
    }
    by = _;
    return agg;
  };

  agg.x = function (_) {
    if (!arguments.length) {
      return x;
    }
    x = _;
    return agg;
  };

  agg.y = function (_) {
    if (!arguments.length) {
      return y;
    }
    y = _;
    return agg;
  };

  agg.run = function (data) {
    return agg(data);
  };

  return agg;
}

module.exports = aggregate;
