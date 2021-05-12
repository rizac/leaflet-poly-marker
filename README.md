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
- Easy Polygon definition with no maths: just provide a shortcut symbol (as in Python's
  Matplotlib) to draw the desired Polygon:
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


*Note*: This is not a Node.js module, but a small script intended to be included easily in your
web page with Leaflet by including 
[this url](https://raw.githubusercontent.com/rizac/leaflet-poly-marker/main/polymarker.min.js)
(or the relative [uncompressed version](https://raw.githubusercontent.com/rizac/leaflet-poly-marker/main/polymarker.js) for debugging)
in your &lt;script&gt; tag, as in the snippet above.

