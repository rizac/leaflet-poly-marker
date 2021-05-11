L.polyMarker = {

    // supported symbols (if not found, defaults to "o": circle marker) for Leaflet Polygons:
    symbols: {
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

    new: function(type, latLng, size, map, options){
        if (!(type in L.polyMarker.symbols)){
            // return CircleMarker (it does not need to be resized on zoom
            // default to circle:
            options.radius = size / 2.0;
            return L.circleMarker(latLng, options);
        }
        var [latlngs, options] = L.polyMarker._newPolygon(type, latLng, size, map, options);
        options._polyMarkerArguments = [type, latLng, size];
        marker = L.polygon(latlngs, options);
        marker.on("add", function(event){
            L.polyMarker.startResizingPathOnZoomChanges(event.target, event.target._map);
        });
        marker.on("remove", function(event){
            L.polyMarker.stopResizingPathOnZoomChanges(event.target);
        });
        return marker;
    },

    _newPolygon: function(type, latLng, size, map, options){
        // Create a marker of the given type. The marker will be created with L.Ploygon
        // because it is much more lightweighted than other options such  as SVGIcons. The
        // drawback is that the marker size must be resized on map zoom end
        // (FYI on svg marker icon, see https://groups.google.com/forum/#!topic/leaflet-js/GSisdUm5rEc)

        // Note: All Leaflet methods that accept LatLng objects also accept them in a simple
        // Array form and simple object form (unless noted otherwise), so these lines are equivalent:

        var pt = map.latLngToLayerPoint(latLng);  // center of shape in Pt units
        var [startAngle, numSides] = L.polyMarker.symbols[type];
        var [PI, cos, sin, abs] = [Math.PI, Math.cos, Math.sin, Math.abs];
        startAngle = PI * startAngle/180.0  // convert to radians
        var stepAngle = 2*PI/numSides;  // in radians
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

        return [latlngs, options];
    },

    resizeAfterZoom: function(polyMarkers){
        var _new = L.polyMarker._newPolygon;
        polyMarkers.forEach(function(polyMarker){
            var map = polyMarker._map;
            if(map){
                var args = (polyMarker.options || {})._polyMarkerArguments;
                if (args){
                    var [type, latLng, size] = args;
                    var [latlngs, options] = _new(type, latLng, size, map, {});
                    polyMarker.setLatLngs(latlngs);
                    // polyMarker.setStyle(L.Util.extend(polyMarker.options, options));
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