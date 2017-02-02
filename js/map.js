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

function setColor(count) {
    return count > 59 ? '#124345' :
           count > 26 ? '#237061' :
           count > 15 ? '#4C9F70' :
           count >  8 ? '#8BCD75' :
                        '#DCF875';
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

$.getJSON("./assets/us-states.geojson",function(data){
    // set airportTowers to the dataset, and add the cell towers GeoJSON layer to the map
    states = L.geoJson(data,{
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name + ": " + feature.properties.count + " airports");
        },
        style: style,
    }).addTo(map);
});

var airportWithTowerIcon = L.icon({
    iconUrl: "./img/airport1.png",
    shadowUrl: "./img/airport_sd.png",
    iconSize: [18, 18],
    shadowSize: [25, 18],
    iconAnchor: [16, 16],
    shadowAnchor: [16, 16],
    popupAnchor: [-8, -18]
});

var airportNoTowerIcon = L.icon({
    iconUrl: "./img/airport2.png",
    shadowUrl: "./img/airport_sd.png",
    iconSize: [18, 18],
    shadowSize: [25, 18],
    iconAnchor: [16, 16],
    shadowAnchor: [16, 16],
    popupAnchor: [-8, -18]
});

$.getJSON("./assets/airports.geojson",function(data){
    // set airportTowers to the dataset, and add the cell towers GeoJSON layer to the map
    airportTowers = L.geoJson(data,{
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.AIRPT_NAME);
        },
        pointToLayer: function (feature, latlng) {
            if (feature.properties.CNTL_TWR == 'Y') {
                return L.marker(latlng, {icon: airportWithTowerIcon});
            }
            else if (feature.properties.CNTL_TWR == 'N') {
                return L.marker(latlng, {icon: airportNoTowerIcon});
            }
        }
    }).addTo(map);
});

//add a Legend
var legend = L.control({position: 'topright'});

legend.onAdd = function(){
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b>Airports</b><br />';
    div.innerHTML += '<img src="./img/airport1.png" width="16" height="16"><p style="display:inline">  Has Control Tower</p><br />';
    div.innerHTML += '<img src="./img/airport2.png" width="16" height="16"><p style="display:inline">  No Control Tower</p>';
    div.innerHTML += '<hr />';
    div.innerHTML += '<b># of Airports</b> <br />';
    div.innerHTML += '<i style="background: #DCF875;"></i><p>1 - 7</p>';
    div.innerHTML += '<i style="background: #8BCD75;"></i><p>8 - 14</p>';
    div.innerHTML += '<i style="background: #4C9F70;"></i><p>15 - 25</p>';
    div.innerHTML += '<i style="background: #237061;"></i><p>26 - 59</p>';
    div.innerHTML += '<i style="background: #124345;"></i><p>59+</p>';

    return div;
}

legend.addTo(map);

// add scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(map);