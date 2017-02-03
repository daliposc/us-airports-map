/**
map.js:
    - Add Leaflet window w/ Basemap
    - Draw US States layer onto map
    - Draw Airports layer onto map
    - Draw map elements (Legend & Scale)
    - Add search functionalisty
**/

/** Add a leaflet window with a basemap**/
// initialize map object
var map = L.map('map', {center: [44.2356202,-96.9467764], zoom: 4});

// add basemap to leaflet map object
L.tileLayer(('https://api.mapbox.com/styles/v1/connord/ciy3qjp5800012spckvsivlx8/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY29ubm9yZCIsImEiOiJjaXIya3VjYXgwMDA4ZnBubWMwbGM4aW4yIn0.OmX2i2_gUHm12VynRff6qA'),
    {maxZoom: 12, minZoom: 3, attribution: 'Mapbox &copy | OpenStreetMaps &copy'}).addTo(map);


/** Initialize global variables **/
// map layers + arrays w/ airport names and correpondant latlng for searching
var states;
var airportTowers;
var nameIndex = [];
var latlngIndex =[];


/** Styling, then adding the States Cloropleth **/
// define cloropleth color ramp breaks
function setColor(count) {
    return count > 59 ? '#810f7c' :
           count > 26 ? '#8856a7' :
           count > 15 ? '#8c96c6' :
           count >  8 ? '#b3cde3' :
                        '#edf8fb';
}
// set the style of a single state feature
function style(feature) {
    return {
        fillColor: setColor(feature.properties.count),
        fillOpacity: 0.8,
        weight: 2,
        opacity: 1,
        color: '#fff',
        dashArray: '4'
    };
}
// draw states geoJson layer
$.getJSON("./assets/us-states.geojson",function(data){
    // geoJson object
    states = L.geoJson(data,{
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name + ": " + feature.properties.count + " airports");
        },
        style: style,
    }).addTo(map);
});

/** Style and add airports point payer **/
// Sets the style of airport marker icons, sizes them based on zoomLevel 
function getAirportIcon(hasTower, zoomLevel) {
    var airportNoTowerIcon = L.icon({
        iconUrl: "./img/airplane-red.svg",
        //shadowUrl: "./img/airport.png",
        iconSize: [zoomLevel*2, zoomLevel*2],
        iconAnchor: [zoomLevel/2, zoomLevel/2],
        popupAnchor: [0, 0]
    });

    var airportWithTowerIcon = L.icon({
        iconUrl: "./img/airplane-blue.svg",
        iconSize: [zoomLevel*2, zoomLevel*2],
        iconAnchor: [zoomLevel*2, zoomLevel*2],
        popupAnchor: [0, 0]
    })
    
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
            layer.bindPopup(feature.properties.AIRPT_NAME + "<br/>" + feature.properties.CITY + ", " + feature.properties.STATE);
        },
        pointToLayer: function (feature, latlng) {
            var zoomLevel = map.getZoom();

            //add info to search arrays for each new marker
            nameIndex.push(feature.properties.IATA);
            latlngIndex.push(latlng);

            if (feature.properties.CNTL_TWR == 'Y') {
                return L.marker(latlng, {icon: getAirportIcon("y", zoomLevel)});
            }
            else if (feature.properties.CNTL_TWR == 'N') {
                return L.marker(latlng, {icon: getAirportIcon("n", zoomLevel)});
            }
        }
    }).addTo(map);

});
// change icon size on zoom by setting a new icon based on the old and updating
map.on('zoomend', function() {
    airportTowers.eachLayer( function(marker) {
        var zoomLevel = map.getZoom();
        var newicon = marker.options.icon;
        newicon.options.iconSize = [zoomLevel*2, zoomLevel*2];
        marker.setIcon(newicon)
    });
});

/**Adding Map Elements (Legend and Scale)**/
// create legend control and style it with html/css
var legend = L.control({position: 'topright'});

legend.onAdd = function(){
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b>Airports</b><br />';
    div.innerHTML += '<img src="./img/airplane-blue.svg" width="16" height="16"><p style="display:inline">Has Control Tower</p><br />';
    div.innerHTML += '<img src="./img/airplane-red.svg" width="16" height="16"><p style="display:inline">No Control Tower</p>';
    div.innerHTML += '<em style="font-size: 10pt; display:block">Click an airport for more info.</em>'
    div.innerHTML += '<hr />';
    div.innerHTML += '<b># of Airports</b><br/>';
    div.innerHTML += '<i style="background: #edf8fb;"></i><p style="margin-top:0px">1 - 8</p>';
    div.innerHTML += '<i style="background: #b3cde3;"></i><p>9 - 15</p>';
    div.innerHTML += '<i style="background: #8c96c6;"></i><p>16 - 26</p>';
    div.innerHTML += '<i style="background: #8856a7;"></i><p>27 - 59</p>';
    div.innerHTML += '<i style="background: #810f7c;"></i><p>60+</p>';
    div.innerHTML += '<em style="font-size: 10pt">Click a state to see the number of airports.</em>'

    return div;
}

legend.addTo(map);

// add scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(map);

/** Search Functionality **/
//search by airport abbreviation and zoom to that point
$(document).ready(function(){
    //on button press
    $("button").click(function(){
        //get text from the search box input
        var searchText = $("input:text").val();
        //check if that airport abbrv exists; if so: zoom to it and show a popup, else: tell the user
        if (nameIndex.indexOf(searchText.toUpperCase()) != -1) {
            map.setView(latlngIndex[nameIndex.indexOf(searchText.toUpperCase())], 7);

            L.popup()
                .setLatLng(latlngIndex[nameIndex.indexOf(searchText.toUpperCase())])
                .setContent("<h2>" + searchText.toUpperCase() + "</h2>")
                .openOn(map);

            $('#notfound').text(" ");
        }
        else {
            $('#notfound').text("'" + searchText + "'" + " not found on map");
        }
    });

    //Call a button click function when 'Enter' key is pressed
    $("#search").keypress(function (e) {
        if (e.which == 13) {
            $("button").click();
        }
    });
});
