L.PolygonMarker = L.Polygon.extend({

    // @section
	// @aka CircleMarker options
	options: {
		type: '^',

		// @option radius: Number = 10
		// Radius of the circle marker, in pixels
		radius: 10,

		side: null,
	},

	markers: {  // defined in the __proto__ (so shared across instances and not created each time). Same for options above
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
	    if (!(options.type in this.markers)){
	        options.type = 's';
	    }
		L.Util.setOptions(this, options);  // merge options defined in __proto__ with this instance options
		L.Polygon.prototype.initialize.call(this, [], options)
		if (Array.isArray(latlng)){
    		latlng = L.latLng(latlng[0], latlng[1]);
    	}
    	this._latlng = latlng;
	},

//    beforeAdd: function (map) {
//        this._mapZoom = null;
//        L.Polygon.prototype.beforeAdd.call(this, map);
//	},

    onRemove: function () {
        delete this._mapZoom;
		L.Polygon.prototype.onRemove.call(this);
	},

    getCenter: function () {  // Overrides getCenter as we do not need to calculate it here
        return this._latlng;
    },

    _project: function () {   // This is called when map is zoomed ('zoomend'). See Renderer._onZoomEnd
		if (this._map && this._map.getZoom() !== this._mapZoom) {
		    this._mapZoom = this._map.getZoom();
    		this._setLatLngs(this.computeLatLngs(this._map));
    	}
		L.Polygon.prototype._project.call(this);
	},

	computeLatLngs: function(map){
	    // Note: All Leaflet methods that accept LatLng objects also accept them in a simple
        // Array form and simple object form (unless noted otherwise)
        var type = this.options.type;
        var [startAngle, numSides] = this.markers[type];
        var [PI, cos, sin, abs] = [Math.PI, Math.cos, Math.sin, Math.abs];
        startAngle = PI * startAngle / 180.0  // convert to radians
        var stepAngle = 2*PI / numSides;  // in radians
        var angles = new Array(numSides).fill(0).map((element, index) => index*stepAngle + startAngle);
        var radius = size / 2.0;
        var latLng = this._latlng;
        var center = map.latLngToLayerPoint(latLng);  // center of shape in Pt units
        var latlngs = angles.map(function(angle, index){
            var [x, y] = [radius*cos(angle), radius*sin(angle)];
            return map.layerPointToLatLng(new L.Point(center.x + x, center.y + y));
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
