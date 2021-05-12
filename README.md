# leaflet-poly-marker

(Disclaimer: This is not a Node.js module, but a small script intended to be included 
easily in your HTML page with Leaflet)

Polygonal Markers in Leaflet map:

```html
    // include src (use non-minified URL for debugging) 
    // or copy/paste the js code in your script tag
    <script type='text/javascript' src='https://raw.githubusercontent.com/rizac/leaflet-poly-marker/main/polymarker.min.js'>
    
    // add Markers in your code:
    <script type='text/javascript'>
        // Given a map object:
        var map = L.map(...);

        // Create a Pentagon ('p') centered at [lat, lon] = [30, 40]
        // The constructor is similar to CircleMarker(latLng, options):
        var pmarker = L.polyMarker([30, 40], {marker: 'p', ...}).addTo(map);
        
        // You can also supply the marker as second argument (will be merged in options):
        var pmarker = L.polyMarker([30, 40], 'p', {...}).addTo(map);
         
        // When the marker is numeric (integer), it defines the Polygon sides.
        // E.g., to draw a Dodecagon (12 sides):
        var pmarker = L.polyMarker([30, 40], {marker: 12, ...}).addTo(map);
    </script>
```

Features:

- Behaves as CircleMarker: Give a center in `[lat lon]` coordinates and a size in
  pixel and the marker will be zoom independent, i.e. it will **not** expand/shrink 
  while zooming in/out.
- Relatively lightweight (when compared to e.g., DivIcon)
- Easy Polygon definition with no maths: just provide a single character marker (as in Python's
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
  
  (when the marker is given as integer, it defines the numner of sides of the Polygon)