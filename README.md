# leaflet-poly-marker

Polygonal Markers in Leaflet map

Disclaimer: This is not a Node.js module, but a small script intended to be copy/pasted in your code or included 
easily in your HTML page together with [Leaflet](https://leafletjs.com/):
```javascript
<script type='text/javascript' src='https://raw.githubusercontent.com/rizac/leaflet-poly-marker/main/polymarker.min.js'>
```

## Examples

```javascript
// Given a Leaflet map object:
var map = L.map(...);

// Create a Pentagon ('p') centered at [lat, lon] = [30, 40]. with size in pixel
// given as the `radius`of the enclosing circle (default radius when missing: 10)
var pmarker = L.polyMarker([30, 40], {marker: 'p', radius: 10, ...}).addTo(map);
        
// You can also supply the marker as second argument.
// A missing marker defaults to 's' (square Polygon)
var pmarker = L.polyMarker([30, 40], 'p', {...}).addTo(map);

// When the marker is numeric (integer), it defines the Polygon sides.
// E.g., to draw a Dodecagon (12 sides):
var pmarker = L.polyMarker([30, 40], {marker: 12, ...}).addTo(map);
```

## Features

- PolyMarker is a leaflet Polygon but behaves as CircleMarker: given a center in `[lat lon]` coordinates the Polygon will be drawn around it
  and preserve its size *in pixel*, i.e. it will **not** expand or shrink while zooming in or out. Regardless of this, all PolyMarker options
  are inherited from Polygion (see 'Options' section [here](https://leafletjs.com/reference-1.7.1.html#polygon)) with the addition of
  `marker` and `radius` 
- Relatively lightweight (when compared to e.g., DivIcon)
- Easy Polygon definition with no maths: just provide a single character marker (as in Python's
  Matplotlib) to draw the desired Polygon around its center (or an integer to define the polygon sides):
  - `s` square
  - `v` triangle_down
  - `^` triangle_up
  - `<` triangle_left
  - `>` triangle_right
  - `8` octagon
  - `p` pentagon
  - `h` hexagon1
  - `H` hexagon2
  - `D` diamond
  - `d` thin_diamond (horizontal side halved)
