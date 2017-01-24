(function($, window, document) {

'use strict';

/*
 * Chart.js specific
 */

var updateChart = function(divElement, title, dataset, meta) {

    // Everything in here is chart.js specific, including workarounds...

    // TODO: Brute force destroy of chart seems to be needed to properly clear state.
    // It also seems to stop the animation happening.
    if (meta.chartObj) {
        meta.chartObj.clear();
        meta.chartObj.destroy();
        delete meta.chartObj;
    }

    var elem = divElement.find(".chartCanvas")[0];
    var ctx = elem.getContext("2d");
    elem.width = meta.width;
    elem.height = meta.height;
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dataset.keys,
            datasets: [{
                label: title,
                data: dataset.values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ]
            }]
        },
        options: {
            legend: {
                labels: {
                    boxWidth: 0
                }
            },
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                xAxes: [{
                    barPercentage: 0.5,
                    display: false
                }],
                yAxes: [{
                    display: false,
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });

    // Redraw, and attach the new chart object
    chart.update(true);
    meta.chartObj = chart;
};

var prepareChartElement = function(elem) {
    // Everything in here is chart.js specific, including workarounds...

    var canvas = $('<canvas/>', {class: "chartCanvas", width:"100%", height:"100%"});
    elem.append(canvas);
    return {
        chartObj: null,
        width: elem.width(),
        height: elem.height()
    };
};

/*
 * Private functions
 */

var collate = function(data) {
    var counts = {}, order = [];
    for (var i = 0; i < data.length; i++) {
        if (counts.hasOwnProperty(data[i])) {
            counts[data[i]] += 1;
        } else {
            order.push(data[i]);
            counts[data[i]] = 1;
        }
    }

    return {order:order, data:counts};
};

var makeColumnDataset = function(dt, columnIndex) {
    var original = dt.column(columnIndex).data();
    var all = collate(original);
    var filtered = collate(dt.column(columnIndex, {search:'applied'}).data());
    var dataset = { keys:[], values:[] };
    for (var i = 0; i < all.order.length; i++) {
        var key = all.order[i];
        dataset.keys.push(key);
        if (filtered.data.hasOwnProperty(key)) {
            dataset.values.push(filtered.data[key]);
        } else {
            dataset.values.push(0);
        }
    }

    return dataset;
};

/*
 * DataTables API
 */

var DataTable = $.fn.dataTable;
DataTable.chart = {};
DataTable.chart.version = '0.1.0';

DataTable.chart.redraw = function (dt) {
    var ctx = dt.settings()[0]._chart;
    for (var i = 0; i < ctx.columns.length; i++) {
        var col = ctx.columns[i];
        var dataset = makeColumnDataset(dt, col.idx);
        var divElement = $(col.chart);
        updateChart(divElement, col.sTitle, dataset, ctx.meta[col.chart]);
    }
};

DataTable.chart.init = function (dt, settings) {
    var ctx = dt.settings()[0];

    ctx._chart = {};

    // Collect references to columns which are charted
    ctx._chart.columns = ctx.aoColumns.filter(function (x) {
        return x.hasOwnProperty("chart");
    });

    ctx._chart.meta = {};

    for (var i = 0; i < ctx._chart.columns.length; i++) {
        var col = ctx._chart.columns[i];
        var elem = $(col.chart);

        // Maintain chart meta keyed by selector
        ctx._chart.meta[col.chart] = prepareChartElement(elem);
    }

    dt.on('draw.dt', function () {
        DataTable.chart.redraw(dt);
    });
};

$(document).on('preInit.dt.dtChart', function (e, settings, json) {
    if ( e.namespace !== 'dt' ) {
        return;
    }

    var dt = new DataTable.Api(settings);
    DataTable.chart.init(dt);
});


})(jQuery, document, window);
