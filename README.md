# leaflet_poly_marker

Polygonal Markers in Leaflet map:

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
Just copy the minified version or use as src in your module the Github URL of
the raw file.

# Usage

```javascript
    // Given a map object, create a marker at lat lon [30, 40]:
    var pmarker = L.PolygonMarker([30, 40], 's', {width:1}).addTo(map);
    // you can also supply the marker in the options object:
    var marker = L.PolygonMarker([30, 40], {marker: 's', width:1}).addTo(map);
```