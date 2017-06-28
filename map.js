var features;
var data;
var lastYear;

var bounds = [[-40, -110], [60, 165]];
var map = L.map('map', {
  zoomSnap: 0.2,
  zoomDelta: 1,
  attributionControl: false
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

/*
L.rectangle(bounds, {
  fill: false
}).addTo(map);
*/

// https://coderwall.com/p/duapqq/use-a-google-spreadsheet-as-your-json-backend
// https://spreadsheets.google.com/feeds/list/0AtMEoZDi5-pedElCS1lrVnp0Yk1vbFdPaUlOc3F3a2c/od6/public/values?alt=json-in-script&callback=x
// https://stackoverflow.com/questions/24531351/retrieve-google-spreadsheet-worksheet-json
$.getJSON('//spreadsheets.google.com/feeds/list/1Fd-vBoJPjp5wdCyJc7d_LOJPOg5uqdzVa3Eq5-VFR-g/1/public/values?alt=json-in-script&callback=?', function(sheet) {
  var years = [];
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

    data[id] = {
      name: row['gsx$name']['$t']
    };

    data[id][lastYear] = row['gsx$y' + lastYear]['$t'];
  });

  onDataLoad();
});

function onDataLoad() {
  if (features && data) {
    features.eachLayer(function(item) {

      var code = item.feature.properties.ISO_A2;

      if (code === 'IN') {
        code = 'IN-' + item.feature.properties.POSTAL;
      }

      if (code && data[code] && data[code][lastYear]) {
        var value = data[code][lastYear];

        item.setStyle({
          fillColor: value === 's' ? '#43a2ca' : '#a8ddb5'
        });

        item.bindPopup('<strong>' + data[code].name + '</strong><br/>' + ((value === 's') ? 'National rollout' : 'Programs/partial'));
      }
    });
  }
}