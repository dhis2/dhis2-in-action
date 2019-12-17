$(function() {

  var features;
  var data;
  var years = [];
  var lastYear;

  var stripeColor = '#000000';
  var stripeWidth = 3;

  var colors = {
    p: '#a8ddb5',
    s: '#43a2ca',
    d: '#eeeeee' 
  };

  var bounds = [[-33, -90], [48, 140]];
  var map = L.map('map', {
    zoomSnap: 0.2,
    zoomDelta: 1,
    attributionControl: false,
    scrollWheelZoom: false
  });

  var stripes = Object.keys(colors).reduce(function(obj, letter) {
  
    obj[letter] = new L.StripePattern({
      angle: 45,
      spaceColor: colors[letter],
      spaceOpacity: 1,
      weight: stripeWidth,
      spaceWeight: 5,
      color: stripeColor,
    }).addTo(map);
  
    return obj;
  }, {});

  map.fitBounds(bounds);

  // L.rectangle(bounds).addTo(map);

  $.getJSON('countries_indian_states.json', function(data) {
    features = L.geoJSON(data, {
      color: '#555',
      weight: 1,
      fillColor: colors.d,
      fillOpacity: 0.8
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
    data = {
      country: {},
      year: {}
    };

    rows.forEach(function(row) {
      var id = row['gsx$code']['$t'];
      var name = row['gsx$name']['$t'];

      var country = data.country[id] = {
        name: name,
        pilot: row['gsx$pilot']['$t'] || null,
        national: row['gsx$scale']['$t'] || null,
        tracker: row['gsx$tracker']['$t'] || null,
        android: row['gsx$android']['$t'] || null,
        emis: row['gsx$emis']['$t'] || null
      };

      years.forEach(function(year) {
        var letters = row['gsx$y' + year]['$t'];

        if (letters.length) {
          country[year] = letters;

          if (!data.year[year]) {
            data.year[year] = {
              p: 0,
              s: 0,
              t: 0,
              a: 0,
              e: 0
            }
          }

          letters.split('').forEach(function(value) {
            data.year[year][value]++;
          });
        }
      });
    });

    onDataLoad();
  });

  function hasLetter(letters, letter) {
    return letters.indexOf(letter) !== -1
  }

  function getStyle(letters) {
    var isPilot = letters.indexOf('p') !== -1;
    var isNational = letters.indexOf('s') !== -1;
    var isEmis = letters.indexOf('e') !== -1;

    if (!isPilot && !isNational && !isEmis) {
      return {};
    }

    if (!isEmis) {
      return {
        fillColor: isPilot ? colors.p : colors.s
      }
    }

    return {
      fillPattern: stripes[isPilot ? 'p' : isNational ? 's' : 'd'],
    }
  }

  function onDataLoad() {
    if (features && data) {
      var countries = data.country

      createChart();

      features.eachLayer(function(item) {

        var code = item.feature.properties.CODE;

        if (code && countries[code] && countries[code][lastYear]) {
          var country = countries[code];
          var letters = country[lastYear];

          if (letters.indexOf('p') !== -1 || letters.indexOf('s') !== -1 || letters.indexOf('e') !== -1) {
            item.setStyle(getStyle(letters));

            var popup = '<h2>' + country.name + '</h2>';

            if (country.pilot) {
              popup += '<div>Health pilot: ' + country.pilot + '</div>';
            }

            if (country.national) {
              popup += '<div>Health national scale: ' + country.national + '</div>';
            }

            if (country.tracker) {
              popup += '<div>Tracker: ' + country.tracker + '</div>';
            }

            if (country.android) {
              popup += '<div>Android: ' + country.android + '</div>';
            }

            if (country.emis) {
              popup += '<div>Education pilot: ' + country.emis + '</div>';
            }

            item.bindPopup(popup);
          }
        }
      });
    }
  }

  function createChart() {
    var pilotByYear = [];
    var nationalByYear = [];
    var emisByYear = [];

    years.forEach(function(year) {
      pilotByYear.push(data.year[year].p);
      nationalByYear.push(data.year[year].s);
      emisByYear.push(data.year[year].e);
    });

    Highcharts.chart('chart', {
      chart: {
        type: 'area'
      },
      title: {
        text: null, // 'Countries using DHIS 2'
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
          text: 'Countries using DHIS 2'
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
        name: 'Health pilot',
        data: pilotByYear,
        color: colors.p
      }, {
        name: 'Health national scale',
        data: nationalByYear,
        color: colors.s,
      }, {
        name: 'Education pilot',
        data: emisByYear,
        color: {
          pattern: {
              path: {
                  d: 'M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11',
                  strokeWidth: stripeWidth,
              },
              backgroundColor: colors.s,
              color: stripeColor,
              width: 10,
              height: 10,
              opacity: 0.8
          }
        }
      }],
      legend: {
        verticalAlign: 'top',
        floating: true,
        itemStyle: {
          fontSize: '14px',
        }
      }
    });
  }

});