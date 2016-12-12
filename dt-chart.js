(function($, window, document) {

'use strict';

var DataTable = $.fn.dataTable;
DataTable.chart = {};
DataTable.chart.version = '0.1.0';

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
}

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
}

DataTable.chart.redraw = function (dt) {
    for (var i = 0; i < dt._chart.columns.length; i++) {
        var col = dt._chart.columns[i];
        var dataset = makeColumnDataset( dt, col.idx );
        updateChart( $(col.chart), col.sTitle, dataset );
    }
}

DataTable.chart.init = function (dt) {
    var ctx = dt.settings()[0];
    var columns = ctx.aoColumns.filter(function (x) {return x.hasOwnProperty("chart")});

    dt._chart = {};
    dt._chart.columns = columns;
    for (var i = 0; i < dt._chart.columns.length; i++) {
        var col = dt._chart.columns[i];
        var elem = $(col.chart);

        prepareChartElement(elem);
    }

    dt.on( 'draw.dt', function () {
        DataTable.chart.redraw( dt );
    });
}

// TODO: Chart.js specific at present
var updateChart = function(divElement, title, dataset) {
    var elem = divElement.find(".chartCanvas")[0];
    var ctx = elem.getContext("2d");
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
}

// TODO: Chart.js specific at present
var prepareChartElement = function(elem) {
    var canvas = $('<canvas/>', {class: "chartCanvas", width:"100%", height:"100%"});
    elem.append(canvas);
}

$(document).on( 'preInit.dt.dtChart', function (e, ctx) {
    if ( e.namespace !== 'dt' ) {
        return;
    }

    DataTable.chart.init( new DataTable.Api( ctx ) );
});


})(jQuery, document, window);
