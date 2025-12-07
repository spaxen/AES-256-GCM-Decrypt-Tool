AES-256-GCM Decrypt Tool — Split project

Files created:
- `index.html` (updated to link assets)
- `css/styles.css` (styles)
- `js/utils.js` (helpers: $, enableAutoSelect, hex/byte helpers)
- `js/crypto.js` (importKey, encrypt, decrypt using Web Crypto API)
- `js/app.js` (DOM wiring and event handlers)

How to run:
1. Open `index.html` in a modern browser (Chrome, Edge, Firefox).
2. The app is fully client-side; no server required.

Notes:
- Keep the script tag order as: `utils.js`, `crypto.js`, `app.js`.
- Do not hardcode secrets. This client-side tool is for convenience and testing only.
