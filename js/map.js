/**
 * Created by daliposc on 1/26/2017.
 */

// initialize map object
var map = L.map('map', {center: [44.2356202,-96.9467764], zoom: 4});

// add basemap to leaflet map object
L.tileLayer(('https://api.mapbox.com/styles/v1/connord/ciy3qjp5800012spckvsivlx8/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY29ubm9yZCIsImEiOiJjaXIya3VjYXgwMDA4ZnBubWMwbGM4aW4yIn0.OmX2i2_gUHm12VynRff6qA'),
    {maxZoom: 12, minZoom: 3, attribution: 'Mapbox &copy | OpenStreetMaps &copy'}).addTo(map);

// initialize map layers
var states;
var airportTowers;

// set color definitions and style for states layer
function setColor(count) {
    return count > 59 ? '#810f7c' :
           count > 26 ? '#8856a7' :
           count > 15 ? '#8c96c6' :
           count >  8 ? '#b3cde3' :
                        '#edf8fb';
}

function style(feature) {
    return {
        fillColor: setColor(feature.properties.count),
        fillOpacity: 0.9,
        weight: 2,
        opacity: 1,
        color: '#fff',
        dashArray: '4'
    };
}

// draw states layer
$.getJSON("./assets/us-states.geojson",function(data){
    // set airportTowers to the dataset, and add the cell towers GeoJSON layer to the map
    states = L.geoJson(data,{
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name + ": " + feature.properties.count + " airports");
        },
        style: style,
    }).addTo(map);
});


// set style for airport tower marker, dependent on having a tower and zoom level
function getAirportIcon(hasTower, zoomLevel) {
    var airportNoTowerIcon = L.icon({
        iconUrl: "./img/airplane-red.svg",
        //shadowUrl: "./img/airport.png",
        iconSize: [zoomLevel, zoomLevel],
        //shadowSize: [25, 18],
        iconAnchor: [16, 16],
        shadowAnchor: [16, 16],
        popupAnchor: [-8, -18]
    });

    var airportWithTowerIcon = L.icon({
        iconUrl: "./img/airplane-blue.svg",
        //shadowUrl: "./img/airport_sd.png",
        iconSize: [zoomLevel, zoomLevel],
        //shadowSize: [25, 18],
        iconAnchor: [16, 16],
        shadowAnchor: [16, 16],
        popupAnchor: [-8, -18]
    });

    if (hasTower == "y") {
        return airportWithTowerIcon;
    }
    else {
        return airportNoTowerIcon;
    }
}

// draw airport marker layer
$.getJSON("./assets/airports.geojson",function(data){
    // set airportTowers to the dataset, and add the cell towers GeoJSON layer to the map
    airportTowers = L.geoJson(data,{
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.AIRPT_NAME);
        },
        pointToLayer: function (feature, latlng) {
            var zoomLevel = map.getZoom();
            if (feature.properties.CNTL_TWR == 'Y') {
                return L.marker(latlng, {icon: getAirportIcon("y", zoomLevel)});
            }
            else if (feature.properties.CNTL_TWR == 'N') {
                return L.marker(latlng, {icon: getAirportIcon("n", zoomLevel)});
            }
        }
    }).addTo(map);
});

//add a Legend
var legend = L.control({position: 'topright'});

legend.onAdd = function(){
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b>Airports</b><br />';
    div.innerHTML += '<img src="./img/airplane-blue.svg" width="16" height="16"><p style="display:inline">  Has Control Tower</p><br />';
    div.innerHTML += '<img src="./img/airplane-red.svg" width="16" height="16"><p style="display:inline">  No Control Tower</p>';
    div.innerHTML += '<hr />';
    div.innerHTML += '<b># of Airports</b> <br />';
    div.innerHTML += '<i style="background: #edf8fb;"></i><p>1 - 7</p>';
    div.innerHTML += '<i style="background: #b3cde3;"></i><p>8 - 14</p>';
    div.innerHTML += '<i style="background: #8c96c6;"></i><p>15 - 25</p>';
    div.innerHTML += '<i style="background: #8856a7;"></i><p>26 - 59</p>';
    div.innerHTML += '<i style="background: #810f7c;"></i><p>59+</p>';

    return div;
}

legend.addTo(map);

// add scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(map);