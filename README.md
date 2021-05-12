# leaflet-poly-marker

Polygonal Markers in Leaflet map:

```javascript
    // include src:
    <script type='text/javascript' src='https://raw.githubusercontent.com/rizac/leaflet-poly-marker/main/PolyMarker.js'>
    // add Markers in your code:
    <script type='text/javascript'>
        // Given a map object, create a Square centered at [lat, lon] = [30, 40]:
        var pmarker = new L.PolyMarker([30, 40], 's', {width:1}).addTo(map);
        // you can also supply the marker in the options object (here draw a Pentagon):
        var marker = new L.PolyMarker([30, 40], {marker: 'p', width:1}).addTo(map);
    </script>
```

Features:

- Behaves as CircleMarker: Give a center in `[lat lon]` coordinates and a size in
  pixel and the marker will be zoom independent, i.e. it will not expand/shrink 
  while zooming in/out.
- Relatively lightweight (when compared to e.g., DivIcon)
- Partial support for Matplotlib marker syntax: just provide a shortcut symbol
  to draw the desired Polygon. Supported marker symbols are:
  - "s" square
  - "v" triangle_down
  - "^" triangle_up
  - "<" triangle_left
  - ">" triangle_right
  - "8" octagon
  - "p" pentagon
  - "h" hexagon1
  - "H" hexagon2
  - "D" diamond
  - "d" thin_diamond

# Install

This is a small snippet of code intended to be included easily in your web page.
Just copy the minified version or use as src in your module the [Github URL of
the raw file](https://raw.githubusercontent.com/rizac/leaflet-poly-marker/main/PolyMarker.js) 


