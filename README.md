# Compatible Dialog

Serve `src/dialog.js` as a classic script with the adjacent `src/polyfill/` directory. The wrapper uses native dialogs when supported and loads the bundled dialog-polyfill 0.5.6 script and stylesheet on demand. The fallback licence is in that directory.

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

Open `test/wrapper.html` for the wrapper demo or `test/index.html` for the upstream polyfill demo.
