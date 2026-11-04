// Browser dialog helpers. Load this classic script beside the polyfill/ directory.
const dialogResponseEvent = 'dialogResponse';
const dialogAssetBase = document.currentScript && document.currentScript.src;
const dialogAssets = new Map();

function dialogSupported() {
	const dialog = document.createElement('dialog');
	const form = document.createElement('form');
	form.setAttribute('method', 'dialog');
	return typeof dialog.show === 'function' && typeof dialog.showModal === 'function' &&
		typeof dialog.close === 'function' && 'returnValue' in dialog && form.method === 'dialog';
}

// Share in-flight downloads. A failed attempt can be retried by the next open.
function loadDialogAsset(name) {
	if (dialogAssets.has(name)) return dialogAssets.get(name);
	const url = new URL('polyfill/' + name, dialogAssetBase).href;
	const isStyle = name.endsWith('.css');
	const element = document.createElement(isStyle ? 'link' : 'script');
	if (isStyle) {
		element.rel = 'stylesheet';
		element.href = url;
	} else {
		element.src = url;
	}
	const loaded = new Promise((resolve, reject) => {
		element.onload = resolve;
		element.onerror = () => {
			element.remove();
			dialogAssets.delete(name);
			reject(new Error('Failed to load ' + url));
		};
		document.head.appendChild(element);
	});
	dialogAssets.set(name, loaded);
	return loaded;
}

function dialogPolyfillPrepare() {
	return Promise.all([loadDialogAsset('dialog.css'), loadDialogAsset('dialog.js')]);
}

const registeredDialogs = new WeakSet();
async function dialogPolyfillIfRequired(dialog) {
	if (registeredDialogs.has(dialog) || dialogSupported()) return;
	await dialogPolyfillPrepare();
	if (!registeredDialogs.has(dialog)) {
		window.dialogPolyfill.forceRegisterDialog(dialog);
		registeredDialogs.add(dialog);
	}
}

// Resolve on a dialogResponse and reject on dismissal. Keep the close listener
// until the browser delivers close so a subsequent open cannot receive a stale event.
const pendingDialogs = new WeakSet();
async function dialogOpen(dialog, modal = true) {
	if (!dialog || dialog.localName !== 'dialog') throw new TypeError('Expected a dialog element');
	await dialogPolyfillIfRequired(dialog);
	if (dialog.open || pendingDialogs.has(dialog)) throw new Error('Dialog is already open');
	pendingDialogs.add(dialog);
	return new Promise((resolve, reject) => {
		let response;
		function cleanup() {
			pendingDialogs.delete(dialog);
			dialog.removeEventListener(dialogResponseEvent, respond);
			dialog.removeEventListener('close', closed);
			dialog.removeEventListener('click', dismissBackdrop);
		}
		function respond(event) {
			if (event.target !== dialog || !dialog.open) return;
			response = { formData: event.detail && event.detail.formData || null };
			dialog.close();
		}
		function closed(event) {
			if (event.target !== dialog) return;
			cleanup();
			if (response) resolve(response);
			else reject();
		}
		function dismissBackdrop(event) {
			if (event.target !== dialog || !modal) return;
			const rect = dialog.getBoundingClientRect();
			if (event.clientX < rect.left || event.clientX >= rect.right ||
				event.clientY < rect.top || event.clientY >= rect.bottom) dialog.close();
		}
		dialog.addEventListener(dialogResponseEvent, respond);
		dialog.addEventListener('close', closed);
		dialog.addEventListener('click', dismissBackdrop);
		try {
			if (modal) dialog.showModal();
			else dialog.show();
		} catch (error) {
			cleanup();
			reject(error);
		}
	});
}

function submitDialogForm(event) {
	const form = event.currentTarget;
	const dialog = form.closest('dialog');
	if (!dialog || !dialog.open) return;
	event.preventDefault();
	dialog.dispatchEvent(new CustomEvent(dialogResponseEvent, { detail: { formData: new FormData(form) } }));
}

function dialogFormBindSubmit(dialog, form) {
	if (form && form.localName === 'form' && form.closest('dialog') === dialog) {
		form.addEventListener('submit', submitDialogForm);
	}
}

function dialogFormsBindAll(dialog) {
	dialog.querySelectorAll('form').forEach(form => dialogFormBindSubmit(dialog, form));
}

function closeWithButton(event) {
	const button = event.currentTarget;
	const dialog = button.closest('dialog');
	if (!dialog || !dialog.open) return;
	event.preventDefault();
	dialog.close(button.name || button.dataset.response || 'true');
}

function dialogFormBindButton(dialog, button) {
	if (button && button.localName === 'button' && button.closest('dialog') === dialog) {
		button.addEventListener('click', closeWithButton);
	}
}

function dialogButtonsBindAll(dialog) {
	dialog.querySelectorAll('button').forEach(button => dialogFormBindButton(dialog, button));
}
