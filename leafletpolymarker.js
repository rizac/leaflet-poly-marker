/*
function createLegend(map){
	var legend = L.control({position: 'bottomleft'});
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info-legend');
	    var child = document.getElementById('legend');
	    child.parentNode.removeChild(child);
	    div.appendChild(child);
	    return div;
	};
	legend.addTo(map);
}

// create the options menu. This is in a function so that it can be called
// after the page has rendered AND SHOULD BE CALLED ONLY ONCE
function createOptionsMenu(map){
	var options = L.control({position: 'topright'});
	options.onAdd = function (map) {
	    var div = L.DomUtil.create('div', 'info-legend options');
	    var child = document.getElementById('options');
	    child.parentNode.removeChild(child);
	    div.appendChild(child);
	    // disable clicks and mouse wheel, so enable scrolling on the div:
	    // https://github.com/dalbrx/Leaflet.ResizableControl/blob/master/src/Leaflet.ResizableControl.js#L98
	    L.DomEvent.disableClickPropagation(child);  // for safety (is it needed?)
        L.DomEvent.on(child, 'mousewheel', L.DomEvent.stopPropagation);

        // add mouse out over effect (hide/ set visible like layers control)
        var icon = L.DomUtil.create('div', 'options_icon');
        icon.innerHTML = 'Options';
        div.appendChild(icon);
        var isOptionsDivVisible = true;
        function setVisible(e, visible){
        		if (visible != isOptionsDivVisible){
        			child.style.display = visible ? 'block' : 'none';
        			icon.style.display = visible ? 'none' : 'inline-block';
        			isOptionsDivVisible = visible;
	        		if (e){
	        			L.DomEvent.stopPropagation(e);
	        		}
        		}
        };
        var showFunc = function(e){setVisible(e, true)};
        var hideFunc = function(e){setVisible(e, false)};

        // To use the options button as the leaflet control layer (using click event is more complex,
        // as we should keep the icon div above visible, change its name to 'hide', and place it on the div):
        L.DomEvent.on(div, 'mouseover', showFunc);
        L.DomEvent.on(div, 'mouseout', hideFunc);

        // Set the default options div visibility:
        setVisible(null, false);
	    return div;
	    //return child;
	};
	options.addTo(map);

}

function createMap(){
	// creates the leaflet map, setting its initial bounds. Call map.getBounds() to return them
	GLOBALS.map = map = new L.Map('map');
	// initialize the map if not already init'ed
	L.esri.basemapLayer("Topographic").addTo(map);
	// L.esri.basemapLayer("OceansLabels").addTo(map);
	createLegend(map);
	createOptionsMenu(map);
	// create bounds and fit now, otherwise the map mathods latlng will not work:
	var [minLat, minLon] = [1000, 1000];
	var [maxLat, maxLon] =[0, 0];
	var sta_data = GLOBALS.sta_data;
	var stations = [];
	for (var ii = 0; ii < sta_data.length; ii+=2){
		var staName = sta_data[ii];
		var staData = sta_data[ii+1];
		var lat = staData[1];
		var lon = staData[2];
		if (lat < minLat){
			minLat = lat;
		}
		if (lat > maxLat){
			maxLat = lat;
		}
		if (lon < minLon){
			minLon = lon;
		}
		if (lon > maxLon){
			maxLon = lon;
		}
		stations.push([staName, staData, L.latLng(lat, lon)]);
	}
	GLOBALS.sta_data = stations;
	if (minLat == maxLat){
		minLat -= 0.1;
		maxLat += 0.1;
	}
	if(minLon == maxLon){
		minLon -= 0.1;
		maxLon += 0.1;
	}
	var corner1 = L.latLng(minLat, minLon),
	corner2 = L.latLng(maxLat, maxLon),
	__bounds = L.latLngBounds(corner1, corner2);
	map.fitBounds(__bounds);
	// init listeners (just once):
	map.on("zoomend", function (e) {
		// console.log("ZOOMEND", e);
		updateMap();
	});
	// moveend has a problem: it might be moved when showing a popup
	// in this case the map is updated and the popup venishes...
//	map.on("moveend", function (e) {
//		// console.log("ZOOMEND", e);
//		updateMap();
//	});
	return map;
}

function updateMap(){
	// updates the map in a timeout in case of poor perfs
	var loader = document.getElementById("loadingDiv");
	loader.style.display = "block";
	setTimeout(function(){ _updateMap(); loader.style.display = "none";}, 25);
}

function _updateMap(){
	//
	// Updates the map with the given data and the given selected labels
	// This function is called on zoom to resize the markers, as they are of type Leaflet.ploygon,
	// which are much more lightweight than svgicons but with sizes relative to the map coordinates,
	// thus zoom dependent, whereas we want them zoom independent
	//
	var {datacenters, seldatacenters, networks, codes, selcodes, downloads, seldownloads} = GLOBALS;

	var map = GLOBALS.map;
	if(!map){
		map = createMap();
	}else{
		map.removeLayer(GLOBALS.mapLayer);
	}
	// sta_sta might have been modified if map has to be initialized, set it here:
	sta_data = GLOBALS.sta_data;
	var mapBounds = map.getBounds();  // not used, left here to avoid re-googling it in case ...
	// alias for document.getElementById:
	var htmlElement = document.getElementById.bind(document);  // https://stackoverflow.com/questions/1007340/javascript-function-aliasing-doesnt-seem-to-work

	var dcStats = {}; //stores datacenter id mapped to markers, selected and total segments
	var minVal = 1.0;
	var maxVal = 0.0;
	// Although we do not use svg icons anymore (which have poor perfs) we should not
	// need visibleMarkers to display only visible markers, probably the Object below
	// was kept anyway to make map lighter:
	var visibleMarkers = {};
	var outb =0;
	var below = 0;
	var stazz = 0;
	// now calculate datacenters stats, ok, malformed for each station, and which station markers should be displayed:
	for (var i = 0; i < sta_data.length; i++){
		var [staName, staData, latLng] = sta_data[i];
		var [ok, malformed, total] = processStation(staName, staData, selcodes, seldownloads, seldatacenters);
		if (!total){
			continue;
		}
		var [staId, lat, lon, dcId, netIndex] = staData;
		// get datacenter id and update dc stats:
		if (!(dcId in dcStats)){
			dcStats[dcId] = {'total':0, 'ok':0};
		}
		var dcStat = dcStats[dcId];
		dcStat.total += total;
		dcStat.ok += ok;
		// if exactly centered on another marker (according to the current map resolution, in pixels)
		// show only the one with higher value (=% of segments in selected catagories):
		var key = map.latLngToLayerPoint(latLng);
		key = [key.x, key.y].toString();  // in any case js objects convert keys to string
		var insert = !(key in visibleMarkers);
		if (!insert){
			var [mySize, myVal] = getSizeAndValue(ok, malformed, total);
			var [staName_, netName_, staId_, latLng_, dcId_, datacenter_, ok_, malformed_, total_] = visibleMarkers[key];
			var [otherSize, otherVal] = getSizeAndValue(ok_, malformed_, total_);
			if(myVal > otherVal){
				insert = true;
			}
		}
		if(insert){
			var netName = networks[netIndex];
			visibleMarkers[key] = [staName, netName, staId, latLng, dcId, datacenters[dcId], ok, malformed, total];
			stazz += 1;
		}else{
			below +=1;
		}
	}

	console.log(`inserted ${stazz}, outofbounds ${outb}, overlapping-hidden ${below}`);

	// now display the markers:
	var allMarkers = [];
	for (key in visibleMarkers){
		var [staName, netName, staId, latLng, dcId, datacenter, ok, malformed, total] = visibleMarkers[key];
		marker =  createMarker(staName, netName, staId, latLng, dcId, datacenter, ok, malformed, total, map);
		allMarkers.push(marker);
	}
	// now sort them:
	allMarkers.sort(function(m1, m2){return m1.options.zIndexOffset - m2.options.zIndexOffset;});

	// print stats for datacenters:
	for (var dcId in datacenters){
		var {ok, total} = (dcId in dcStats) ? dcStats[dcId] : {'ok': 0, 'total': 0};
		//update stats in the dropdown menu Options:
		htmlElement(`dc${dcId}total`).innerHTML = total;
		htmlElement(`dc${dcId}sel`).innerHTML = ok;
		htmlElement(`dc${dcId}selperc`).innerHTML = `${total ? Math.round((100*ok)/total) : 0}%`;
	}
	// set the mapLayer so that we will know what to clear the next time we call this method:
	GLOBALS.mapLayer = new L.featureGroup(allMarkers).addTo(map);
}

function processStation(staName, staData, selectedCodes, selectedDownloads, selectedDatacenters){
	// returns the array [ok, malformed, total] for a given station
	var ok = 0;
	var malformed = 0;
	dcId = staData[3];
	var skipMarker = [0, 0, 0];
	if (!selectedDatacenters.has(dcId)){
		return skipMarker;
	}
	// compute malformed and ok:
	var skipStation = true;
	var STARTDATAINDEX = 5;
	for (var i = STARTDATAINDEX; i < staData.length; i+=2){
		var downloadId = staData[i];
		var downloadData = staData[i+1];
		if (!selectedDownloads.has(downloadId)){
			continue;
		}
		skipStation = false;
		for (var j = 0; j < downloadData.length; j+=2){
			var codeIndex = downloadData[j];
			var numSegments = downloadData[j+1];
			if (selectedCodes.has(codeIndex)){
				ok += numSegments;
			}else{
				malformed += numSegments;
			}
		}
	}
	if (skipStation){
		return skipMarker;
	}
	return [ok, malformed, ok+malformed];
}

function createMarker_(type, latLng, size, map, options){
	// Create a marker of the given type. The marker will be created with L.Ploygon
	// because it is much more lightweighted than other options such  as SVGIcons. The
	// drawback is that the marker size must be resized on map zoom end
	// Parameters:
	// type: either '^', 'v', 'd', 's', 'c'
	// map the Leaflet map creaated with L.map(...)
	// latLng the marker coordinates, as a latLng object or an array of two elements
	//     (lat lon). The marker will be built with this coordinates as its center
	//     size: the marker size, in pts
	// options: an Object of options to be passed as second argument of L.polygon(...), e.g.:
	//     {fillOpacity: 1, color: "#333", fillColor:"rgb(255, 0, 120)", weight:1, zIndexOffset: 100}
	//
	// (FYI on svg marker icon, see https://groups.google.com/forum/#!topic/leaflet-js/GSisdUm5rEc)

    // Initialize array of lat lng coordinates we are up to populate:
    var latlngs = [];
    // Get Layer coordinates in pts from the given map coordinates in latLng:
    var pt = map.latLngToLayerPoint(latLng);
    // supported symbols (if not found, defaults to "o": circle marker):
    var symbols = ["s", "D", "^", "v", "<", ">", "p"];
    var symbolIndex = symbols.indexOf(type);

    if (symbolIndex == 0){  // square: []
        var [w, h] = [size/2.0, size/2.0];
        var latlng2 = map.layerPointToLatLng(new L.Point(pt.x+w, pt.y+h));
        var lonW = Math.abs(latlng2.lng - latLng.lng);  // longitudinal width
        var latH = Math.abs(latlng2.lat - latLng.lat);  // latitudinal height
        // get Polygon array of points (in lat/lon coordinates):
        latlngs = [[lat-latH, lon-lonW], [lat+latH, lon-lonW], [lat+latH, lon+lonW], [lat-latH, lon+lonW]];
    }else if (symbolIndex == 1){  // diamond: <>
        var sqrt2 = 1.4142135624
        var [w, h] = [sqrt2*size/2.0, sqrt2*size/2.0];  // height of a triangular equilateral
        var latlng2 = map.layerPointToLatLng(new L.Point(pt.x+w, pt.y+h));
        var lonW = Math.abs(latlng2.lng - latLng.lng);  // longitudinal width
        var latH = Math.abs(latlng2.lat - latLng.lat);  // latitudinal height
        // get Polygon array of points (in lat/lon coordinates):
        latlngs = [[lat, lon-lonW], [lat+latH, lon], [lat, lon+lonW], [lat-latH, lon]];
    }else if (symbolIndex == 6){  // pentagon
        var start, step = [18, 72];  // angles

        for (var i=0; i<5; i++){
            var [x, y] = [size*Math.cos(start)/2.0, size*Math.sin(start)/2.0];
            var latlng2 = map.layerPointToLatLng(new L.Point(x, y));
            start += step
        }
        var sqrt2 = 1.4142135624
        var [w, h] = [sqrt2*size/2.0, sqrt2*size/2.0];  // height of a triangular equilateral
        var latlng2 = map.layerPointToLatLng(new L.Point(pt.x+w, pt.y+h));
        var lonW = Math.abs(latlng2.lng - latLng.lng);  // longitudinal width
        var latH = Math.abs(latlng2.lat - latLng.lat);  // latitudinal height
        // get Polygon array of points (in lat/lon coordinates):
        latlngs = [[lat, lon-lonW], [lat+latH, lon], [lat, lon+lonW], [lat-latH, lon]];
    }else if (symbolIndex > 1){  // triangle(s): ^ v < >
        var sqrt3 = 1.7320508076
        // triangular equilateral width and height (width: half side, height: distance center - side)
        var [w, h] = [size /2.0, (size * sqrt3/2.0)/3.0];
        if (symbolIndex < 4){  // vertical triangle: ^ v
            var latlng2 = map.layerPointToLatLng(new L.Point(pt.x+w, pt.y+h));
        }else{  // horizontal triangle: < >
            var latlng2 = map.layerPointToLatLng(new L.Point(pt.x+h, pt.y+w));
        }
        // calculate longitudinal and latitudinal dimensions:
        var lonW = Math.abs(latlng2.lng - latLng.lng);  // longitudinal width
        var latH = Math.abs(latlng2.lat - latLng.lat);  // latitudinal height
        // get Polygon array of points (in lat/lon coordinates):
        if (symbolIndex == 2){ // vertical triangle up: ^
            var [bottomLat, topLat] = [lat - latH, lat + 2 * latH];
            latlngs = [[bottomLat, lon-lonW], [topLat, lon], [bottomLat, lon+lonW]];
        }else if (symbolIndex == 3){  // vertical triangle down: v
            var [topLat, bottomLat] = [lat+latH, lat - 2 * latH];
            latlngs = [[topLat, lon-lonW], [bottomLat, lon], [topLat, lon+lonW]];
        }else if (symbolIndex == 4){  // horizontal triangle left: <
            var [leftLon, rightLon] = [lon - 2 * lonW, lon + lonW];
            latlngs = [[lat+latH, leftLon], [lat, rightLon], [lat-latH, leftLon]];
        }else{  // horizontal triangle right: >
            var [rightLon, leftLon] = [lon + lonW, lon - 2 * lonW]
            latlngs = [[lat+latH, rightLon], [lat, leftLon], [lat-latH, rightLon]];
        }
    }

    if (!latlngs.length()){
        marker = L.circleMarker(latLng, options);
    }
    var marker = L.polygon(latlngs, options);
	return marker;
}
*/

L.polyMarker = {

    // supported symbols (if not found, defaults to "o": circle marker):
    symbols: {
        'd': undefined,
        "s": [45, 4],
        "D": [0, 4],
        "p": [18, 5],
        "h": [30, 6],
        "H": [0, 6],
        "^": [-30, 3],
        "v": [-90, 3],
        "<": [60, 3],
         ">": [0, 3],
         "o": [22.5, 8]
    },

    new: function(type, latLng, size, map, options){
        var [markerFunc, latlngs, options] = L.polyMarker._new(type, latLng, size, map, options);
        options._polyMarkerArguments = [type, latLng, size];
        marker = markerFunc(latlngs, options);
        marker.on("add",function(event){
            L.polyMarker.startResizingPathOnZoomChanges(event.target, event.target._map);
        });
        marker.on("remove",function(event){
            L.polyMarker.stopResizingPathOnZoomChanges(event.target);
        });
        return marker;
    },


    _new: function(type, latLng, size, map, options){
        /* Create a marker of the given type. The marker will be created with L.Ploygon
         * because it is much more lightweighted than other options such  as SVGIcons. The
         * drawback is that the marker size must be resized on map zoom end
         * Parameters:
         * type: either '^', 'v', 'd', 's', 'c'
         * map the Leaflet map creaated with L.map(...)
         * latLng the marker coordinates, as a latLng object or an array of two elements
         *     (lat lon). The marker will be built with this coordinates as its center
         *     size: the marker size, in pts
         * options: an Object of options to be passed as second argument of L.polygon(...), e.g.:
         *     {fillOpacity: 1, color: "#333", fillColor:"rgb(255, 0, 120)", weight:1, zIndexOffset: 100}
         */
        // (FYI on svg marker icon, see https://groups.google.com/forum/#!topic/leaflet-js/GSisdUm5rEc)

    //    var defaultWeight = options['weight'] === undefined ? 3 : options['weight'];
    //    if (size > defaultWeight*2){
    //        size -= defaultWeight*2;
    //    }
        var symbols = L.polyMarker.symbols;
        var marker = null;
        // Initialize array of lat lng coordinates we are up to populate:
        var latlngs = [];
        // Get Layer coordinates in pts:
        var pt = map.latLngToLayerPoint(latLng);

        var startAngleAndNumsides = symbols[type];

        if (!startAngleAndNumsides){
            if(type == 'd'){  // thin diamond:
                if (Array.isArray(latLng)){
                    var [lat, lng] = latLng;
                }else{
                    var [lat, lng] = [latLng.lat, latLng.lng];
                }
                var sqrt2 = 1.4142135624;
                var [w, h] = [sqrt2*size/4.0, sqrt2*size/2.0];  // height of a triangular equilateral
                var latlng2 = map.layerPointToLatLng(new L.Point(pt.x+w, pt.y+h));
                var lonW = Math.abs(latlng2.lng - lng);  // longitudinal width
                var latH = Math.abs(latlng2.lat - lat);  // latitudinal height
                // get Polygon array of points (in lat/lon coordinates):
                var latlngs = [[lat, lon-lonW], [lat+latH, lon], [lat, lon+lonW], [lat-latH, lon]];
                marker = L.polygon(latlngs, options);
                return [L.polygon, latlngs, options];
            }

            // default to circle:
            options.radius = size / 2.0;
            return [L.circleMarker, latLng, options];

        }

        var [startAngle, numSides] = startAngleAndNumsides;
        startAngle = Math.PI * startAngle/180.0
        var stepAngle = 2*Math.PI/numSides;  // 360.0/numSides;
        var angles = new Array(numSides).fill(0).map((element, index) => index*stepAngle + startAngle);
        var radius = size / 2.0;
        var latlngs = angles.map(function(angle, index){
            var [x, y] = [radius*Math.cos(angle), radius*Math.sin(angle)];
            return map.layerPointToLatLng(new L.Point(pt.x+x, pt.y+y));
        });
        return [L.polygon, latlngs, options];

        // Note: All Leaflet methods that accept LatLng objects also accept them in a simple
        // Array form and simple object form (unless noted otherwise), so these lines are equivalent:

    },

    resizeAfterZoom: function(polyMarkers){
        var _new = L.polyMarker._new;
        polyMarkers.forEach(function(polyMarker){
            var map = polyMarker._map;
            if(map){
                var args = (polyMarker.options || {})._polyMarkerArguments;
                if (args){
                    var [type, latLng, size] = args;
                    var [markerFunc, latlngs, options] = _new(type, latLng, size, map, {});
                    polyMarker.setLatLngs(latlngs);
                    polyMarker.setStyle(L.Util.extend(polyMarker.options, options));
                    // polyMarker.redraw();
                }
            }
        });
    },

    startResizingPathOnZoomChanges: function(leafletPath, map){
        var array = L.polyMarker._pathsToResizeOnZoom;
        var startListening = array.length == 0;
        if (startListening){
            map.on("zoomend", L.polyMarker._resizeAfterZoom);
        }
        array.push(leafletPath);
    },

    stopResizingPathOnZoomChanges: function(leafletPath, map){
        var array = L.polyMarker._pathsToResizeOnZoom;
        var index = array.indexOf(marker);
        if (index > -1) {
            array.splice(index, 1);
        }
        var stopListening = array.length === 0;
        if (stopListening){
            map.off("zoomend", L.polyMarker._resizeAfterZoom);
        }
    },

    _resizeAfterZoom: function(event){
        L.polyMarker.resizeAfterZoom(L.polyMarker._pathsToResizeOnZoom);
    },

    _pathsToResizeOnZoom: []
};

//L.FSPolygon = L.Polygon.extend({
//
//
//    initialize: function(name, options) {
//        this.name = name;
//        L.setOptions(this, options);
//
//    }
//
//    addLayer: function (layer) {
//        L.LayerGroup.prototype.addLayer.call(this, layer);
//    },
//
//    removeLayer: function (layer) {
//        L.LayerGroup.prototype.removeLayer.call(this, layer);
//    },
//
//    …
//});