# leaflet-poly-marker

Polygonal Markers in Leaflet map:

```javascript
    // include src:
    <script type='text/javascript' src='https://raw.githubusercontent.com/rizac/leaflet-poly-marker/main/polymarker.min.js'>
    // add Markers in your code:
    <script type='text/javascript'>
        // Given a map object, create a Square centered at [lat, lon] = [30, 40]:
        // With the same constructor as CircleMarker (with 'marker' property instead of 'radius'):
        var pmarker = L.polyMarker([30, 40], {marker: 'p', ...}).addTo(map);
        // Supplying marker as second argument between `[lat, lon]` and `options`:
        var pmarker = L.polyMarker([30, 40], 's', {...}).addTo(map);
        // Polygon with arbotrary number of elements (marker input as integer). E.g., a Dodecagon (12 sides):
        var pmarker = L.polyMarker([30, 40], {marker: 12, ...}).addTo(map);
    </script>
```

Features:

- Behaves as CircleMarker: Give a center in `[lat lon]` coordinates and a size in
  pixel and the marker will be zoom independent, i.e. it will not expand/shrink 
  while zooming in/out.
- Relatively lightweight (when compared to e.g., DivIcon)
- Partial support for Matplotlib marker syntax: just provide a shortcut symbol
  to draw the desired Polygon. Supported marker symbols are:
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

# Install

This is a small snippet of code intended to be included easily in your web page.
Just copy the file content 9for debugging), the minified version, or use as `src`
in your module the [Github URL of the raw file](https://raw.githubusercontent.com/rizac/leaflet-poly-marker/main/polymarker.min.js) 


