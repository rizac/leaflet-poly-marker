L.FSPolygon = L.Polygon.extend({

    // @section
	// @aka CircleMarker options
	options: {
		type: '^',

		// @option radius: Number = 10
		// Radius of the circle marker, in pixels
		radius: 10,

		side: null,
	},

	markers: {  // defined in the __proto__ (soo shared across instances and not created each time). Same for options above
        "s": [45, 4],
        "d": [0, 4],
        "D": [0, 4],
        "p": [18, 5],
        "h": [30, 6],
        "H": [0, 6],
        "^": [-30, 3],
        "v": [-90, 3],
        "<": [60, 3],
        ">": [0, 3],
        "8": [22.5, 8]
    },

	initialize: function(latlng, ...options) {
	    if (options.length == 2){
	        var [type, options] = options;
	        options.type = type;
	    }else{
	        options = options[0];
	    }
		L.Util.setOptions(this, options);  // merge
        if (!(options.type in this.markers)){
            options.type = this.__proto__.options.type;
            // throw `Invalid marker: ${options.type}`;
        }
		L.Polygon.prototype.initialize.call(this, [], options)
		if (Array.isArray(latlng)){
    		latlng = L.latLng(latlng[0], latlng[1]);
    	}
    	this._latlng = latlng;
    	// this._mapZoom = null;
		// this._radius = this.options.radius;
	},

    beforeAdd: function (map) {
        this._mapZoom = null;
        // this._setLatLngs(this.computeLatLngs(map));
        L.Polygon.prototype.beforeAdd.call(this, map);
		// Renderer is set here because we need to call renderer.getEvents
		// before this.getEvents.
		// this._renderer = map.getRenderer(this);
	},

    onRemove: function () {
		this._mapZoom = null;
		L.Polygon.prototype.onRemove.call(this);
	},

    getCenter: function () { //overrides getCenter because we do not need calculations
        return this._latlng;
    },

    _project: function () {   // this is called when map is zoomed (end). See Renderer._onZoomEnd
		if (this._map && this._map.getZoom() !== this._mapZoom) {
		    this._mapZoom = this._map.getZoom();
    		this._setLatLngs(this.computeLatLngs(this._map));
    	}
		L.Polygon.prototype._project.call(this);
	},

	computeLatLngs: function(map){
	    // Note: All Leaflet methods that accept LatLng objects also accept them in a simple
        // Array form and simple object form (unless noted otherwise), so these lines are equivalent:
        var [latLng, type] = [this._latlng, this.options.type, ];
        var pt = map.latLngToLayerPoint(latLng);  // center of shape in Pt units
        var [startAngle, numSides] = this.markers[type];
        var [PI, cos, sin, abs] = [Math.PI, Math.cos, Math.sin, Math.abs];
        startAngle = PI * startAngle / 180.0  // convert to radians
        var stepAngle = 2*PI / numSides;  // in radians
        var angles = new Array(numSides).fill(0).map((element, index) => index*stepAngle + startAngle);
        var radius = size / 2.0;
        var latlngs = angles.map(function(angle, index){
            var [x, y] = [radius*cos(angle), radius*sin(angle)];
            return map.layerPointToLatLng(new L.Point(pt.x+x, pt.y+y));
        });

        // post process for specific types:
        if(type == 'd'){  // thin diamond, shrink horizontal side
            var w = abs(latlngs[0].lng - latlngs[2].lng) / 4.0;
            latlngs[0].lng -= w;
            latlngs[2].lng += w;
        }

        return latlngs;
	}
});


//L.FSPolygon.prototype.markers = {
//    "s": [45, 4],
//    "d": [0, 4],
//    "D": [0, 4],
//    "p": [18, 5],
//    "h": [30, 6],
//    "H": [0, 6],
//    "^": [-30, 3],
//    "v": [-90, 3],
//    "<": [60, 3],
//    ">": [0, 3],
//    "8": [22.5, 8]
//};


//L.polyMarker = {
//
//    // supported symbols (if not found, defaults to "o": circle marker) for Leaflet Polygons:
//    symbols: {
//        "s": [45, 4],
//        "d": [0, 4],
//        "D": [0, 4],
//        "p": [18, 5],
//        "h": [30, 6],
//        "H": [0, 6],
//        "^": [-30, 3],
//        "v": [-90, 3],
//        "<": [60, 3],
//        ">": [0, 3],
//        "8": [22.5, 8]
//    },
//
//    new: function(type, latLng, size, map, options){
//        if (!(type in L.polyMarker.symbols)){
//            // return CircleMarker (it does not need to be resized on zoom
//            // default to circle:
//            options.radius = size / 2.0;
//            return L.circleMarker(latLng, options);
//        }
//        // var [latlngs, options] = L.polyMarker._newPolygon(type, latLng, size, map, options);
//        options._polyMarkerArguments = [type, latLng, size];
//        marker = L.polygon([], options);
//        marker.on("add", function(event){
//            var polygon = event.target;
//            L.polyMarker.refreshSize([polygon]);
//            L.polyMarker.startResizingPathOnZoomChanges(polygon, polygon._map);
//        });
//        marker.on("remove", function(event){
//            L.polyMarker.stopResizingPathOnZoomChanges(event.target);
//        });
//        return marker;
//    },
//
//    getLatLngs: function(type, latLng, size, map){
//        // Create a marker of the given type. The marker will be created with L.Ploygon
//        // because it is much more lightweighted than other options such  as SVGIcons. The
//        // drawback is that the marker size must be resized on map zoom end
//        // (FYI on svg marker icon, see https://groups.google.com/forum/#!topic/leaflet-js/GSisdUm5rEc)
//
//        // Note: All Leaflet methods that accept LatLng objects also accept them in a simple
//        // Array form and simple object form (unless noted otherwise), so these lines are equivalent:
//
//        var pt = map.latLngToLayerPoint(latLng);  // center of shape in Pt units
//        var [startAngle, numSides] = L.polyMarker.symbols[type];
//        var [PI, cos, sin, abs] = [Math.PI, Math.cos, Math.sin, Math.abs];
//        startAngle = PI * startAngle / 180.0  // convert to radians
//        var stepAngle = 2*PI / numSides;  // in radians
//        var angles = new Array(numSides).fill(0).map((element, index) => index*stepAngle + startAngle);
//        var radius = size / 2.0;
//        var latlngs = angles.map(function(angle, index){
//            var [x, y] = [radius*cos(angle), radius*sin(angle)];
//            return map.layerPointToLatLng(new L.Point(pt.x+x, pt.y+y));
//        });
//
//        // post process for specific types:
//        if(type == 'd'){  // thin diamond, shrink horizontal side
//            var w = abs(latlngs[0].lng - latlngs[2].lng) / 4.0;
//            latlngs[0].lng -= w;
//            latlngs[2].lng += w;
//        }
//
//        return latlngs;
//    },
//
//    refreshSize: function(polyMarkers){
//        var getLatLngs = L.polyMarker.getLatLngs;
//        polyMarkers.forEach(function(polyMarker){
//            var map = polyMarker._map;
//            if(map){
//                var args = (polyMarker.options || {})._polyMarkerArguments;
//                if (args){
//                    var [type, latLng, size] = args;
//                    var latlngs = getLatLngs(type, latLng, size, map);
//                    polyMarker.setLatLngs(latlngs);
//                    // polyMarker.setStyle(L.Util.extend(polyMarker.options, options));
//                    // polyMarker.redraw();
//                }
//            }
//        });
//    },
//
//    startResizingPathOnZoomChanges: function(leafletPath, map){
//        var array = L.polyMarker._pathsToResizeOnZoom;
//        var startListening = array.length == 0;
//        if (startListening){
//            map.on("zoomend", L.polyMarker._refreshSize);
//        }
//        array.push(leafletPath);
//    },
//
//    stopResizingPathOnZoomChanges: function(leafletPath, map){
//        var array = L.polyMarker._pathsToResizeOnZoom;
//        var index = array.indexOf(marker);
//        if (index > -1) {
//            array.splice(index, 1);
//        }
//        var stopListening = array.length === 0;
//        if (stopListening){
//            map.off("zoomend", L.polyMarker._refreshSize);
//        }
//    },
//
//    _refreshSize: function(event){
//        L.polyMarker.refreshSize(L.polyMarker._pathsToResizeOnZoom);
//    },
//
//    _pathsToResizeOnZoom: []
//};
