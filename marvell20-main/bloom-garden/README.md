# Bloom Garden

Bloom Garden is a small vanilla HTML/CSS/JavaScript installation game for event iPads. Open `index.html` in a browser, or publish the whole `bloom-garden` folder with the rest of the MARVELL20 site.

## Files

- `index.html` contains the layered scene and UI.
- `styles.css` contains the magical forest layout, mood styling, patch layers, and animation.
- `game.js` handles flower selection, planting, localStorage, moods, particles, tooltips, and reset.
- `assets/` contains source/reference art from the supplied pack. The active game background and flowers are CSS-rendered.

## Time-Based Mood

The game reads the device time and sets `data-mood` on `.game`:

- `morning`: 06:00-15:59
- `dusk`: 16:00-18:59
- `night`: 19:00-05:59

The mood is rechecked once per minute. CSS background layers crossfade between morning, dusk, and night palettes.

## Persistence

Planted flowers are saved on the same device using:

`bloom-garden-contributions-v1`

Each record stores the visitor name, flower type, zone, random offset, rotation, scale, and timestamp.

## Hidden Reset

Operators can reset the garden by pressing `Shift + R` three times within 2 seconds, or by long-pressing the invisible top-left corner for 3 seconds. The browser will ask:

`Reset Bloom Garden?`

## Replacing Art

The active forest background is built in `styles.css` with CSS gradients, tree silhouettes, mist, and ground layers. The active planted flowers are also CSS shapes in `styles.css`, not PNG cutouts.

The supplied `assets/` folder is kept as source/reference material if you want to redesign the CSS later.
