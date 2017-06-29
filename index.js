$(function() {

  var features;
  var data;
  var chartData = {};
  var years = [];
  var lastYear;

  var colors = {
    p: '#a8ddb5',
    s: '#43a2ca'
  };

  var bounds = [[-40, -110], [60, 165]];
  var map = L.map('map', {
    zoomSnap: 0.2,
    zoomDelta: 1,
    attributionControl: false,
    scrollWheelZoom: false
  });

  map.fitBounds(bounds);

  $.getJSON('countries_indian_states.json', function(data) {
    features = L.geoJSON(data, {
      color: '#555',
      weight: 1,
      fillColor: '#eee',
      fillOpacity: 1
    }).addTo(map);
    onDataLoad();
  });

  // https://coderwall.com/p/duapqq/use-a-google-spreadsheet-as-your-json-backend
  // https://spreadsheets.google.com/feeds/list/0AtMEoZDi5-pedElCS1lrVnp0Yk1vbFdPaUlOc3F3a2c/od6/public/values?alt=json-in-script&callback=x
  // https://stackoverflow.com/questions/24531351/retrieve-google-spreadsheet-worksheet-json
  $.getJSON('//spreadsheets.google.com/feeds/list/1Fd-vBoJPjp5wdCyJc7d_LOJPOg5uqdzVa3Eq5-VFR-g/1/public/values?alt=json-in-script&callback=?', function(sheet) {
    var rows = sheet.feed.entry;
    var row = rows[0];

    for (var col in row) {
      if (row.hasOwnProperty(col)) {
        if (col.slice(0, 5) === 'gsx$y') {
          years.push(col.slice(-4));
        }
      }
    }

    lastYear = years[years.length - 1];
    data = {};

    rows.forEach(function(row) {
      var id = row['gsx$code']['$t'];
      var name = row['gsx$name']['$t'];
      var value =

      data[id] = {
        name: name
      };

      years.forEach(function(year) {
        var value = row['gsx$y' + year]['$t'];

        if (value) {
          data[id][year] = row['gsx$y' + year]['$t'] || null;

          if (!chartData[year]) {
            chartData[year] = {
              p: 0,
              s: 0,
            }
          }

          chartData[year][value]++;
        }
      });
    });

    onDataLoad();
  });

  function onDataLoad() {
    if (features && data) {
      createChart();

      features.eachLayer(function(item) {

        var code = item.feature.properties.ISO_A2;

        if (code === 'IN') {
          code = 'IN-' + item.feature.properties.POSTAL;
        }

        if (code && data[code] && data[code][lastYear]) {
          var value = data[code][lastYear];

          item.setStyle({
            fillColor: colors[value]
          });

          item.bindPopup('<strong>' + data[code].name + '</strong><br/>' + ((value === 's') ? 'National rollout' : 'Programs/partial'));
        }
      });
    }
  }


  function createChart() {
    var pilotByYear = [];
    var nationalByYear = [];

    years.forEach(function(year) {
      pilotByYear.push(chartData[year].p);
      nationalByYear.push(chartData[year].s);
    });

    Highcharts.chart('chart', {
      chart: {
        type: 'area'
      },
      title: {
        text: 'Countries using DHIS 2'
      },
      xAxis: {
        categories: years,
        tickmarkPlacement: 'on',
        title: {
          enabled: false
        }
      },
      yAxis: {
        title: {
          text: 'Number of countries'
        }
      },
      tooltip: {
        split: true,
      },
      plotOptions: {
        area: {
          stacking: 'normal',
          lineColor: '#666666',
          lineWidth: 1,
          marker: {
            lineWidth: 1,
            lineColor: '#666666'
          }
        }
      },
      series: [{
        name: 'Pilot',
        data: pilotByYear,
        color: colors.p
      }, {
        name: 'National scale',
        data: nationalByYear,
        color: colors.s
      }]
    });
  }

});