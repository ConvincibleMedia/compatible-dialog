# Compatible Dialog

Serve `dist/dialog.js` (or `dist/dialog.min.js`) as a classic script with the adjacent `dist/polyfill/` directory. The wrapper uses native dialogs when supported and loads the bundled dialog-polyfill 0.5.6 script and stylesheet on demand. The fallback licence is in that directory.

```js
const dialog = document.querySelector('dialog');
dialogFormsBindAll(dialog);
dialogOpen(dialog).then(({ formData }) => {
  console.log(formData.get('answer'));
}, () => {
  // The user dismissed the dialog.
});
```

`dialogOpen(dialog, false)` opens a non-modal dialog. Form bindings resolve the promise with the submitted data. Bind individual dismissal buttons with `dialogFormBindButton(dialog, button)` to set the dialog's return value and dismiss it. Escape, backdrop dismissal and an external close reject the promise. The form and button bindings can be called repeatedly.

Run `npm run serve` and open `/fixtures/wrapper.html` for the wrapper demo or `/fixtures/index.html` for the upstream polyfill demo.


## Development

* `src/` holds source files. `dist/` contains the readable and minified consumable builds.
* `scripts/` holds build helpers. `tests/` contains browser tests, fixtures, server helpers, configuration and generated evidence.
* Run `npm ci` and `npm run test:install` once to install local tooling and the browsers.
* `npm run build` generates both bundles. `npm run build:min` is an alias for the same complete build.
* `npm run lint` builds and checks JavaScript. `npm test` builds and runs both bundles in Chromium, Firefox and WebKit.
* `npm test -- --project=chromium-min` selects one browser and build. `npm run test:headed` displays the browsers.
* `npm run serve` builds and serves the test fixtures. Set `PORT` to override its port, or `TEST_PORT` for automated tests.
* Playwright configuration lives in `tests/playwright.config.js`. Failure traces and screenshots go to `tests/results/`, and the HTML report to `tests/report/`.
