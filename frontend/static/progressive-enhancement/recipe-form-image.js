/*!
	Copyright 2025 Luca Schnellmann <oss@lusc.ch>

	This file is part of recipe-store.

	This program is free software: you can redistribute it
	and/or modify it under the terms of the GNU General Public
	License as published by the Free Software Foundation,
	either version 3 of the License, or (at your option)
	any later version.

	This program is distributed in the hope that it will be
	useful, but WITHOUT ANY WARRANTY; without even the implied
	warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
	PURPOSE. See the GNU General Public License for more details.

	You should have received a copy of the GNU General Public
	License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

// Assumes one form for simplicity

// Elements to preview image
/** @type {HTMLElement} */
const imagePreviewParent = document.querySelector('#image-preview-parent');
/** @type {HTMLElement} */
const imagePreviewSpinner = document.querySelector('#image-preview-spinner');
/** @type {HTMLImageElement} */
const imagePreview = document.querySelector('#image-preview-image');
/** @type {HTMLElement} */
const imageUploadError = document.querySelector('#image-upload-error');

/** @type {HTMLInputElement} */
const uploadedImageInput = document.querySelector('#uploaded-image');

// Elements for the input type="file" and button to clear input
/** @type {HTMLElement} */
const clearableFileInputGroup = document.querySelector(
	'#clearable-file-input-group',
);
/** @type {HTMLInputElement} */
const fileInput = document.querySelector('#file-image');
/** @type {HTMLButtonElement} */
const clearImageButton = document.querySelector('#js-remove-image');

/** @type {HTMLInputElement} */
let csrfTokenInput = document.querySelector('input[name="csrf-token"]');

// To combine file-input and clear button visually,
// it removes the border from the input
// and adds the border to the parent, instead
clearableFileInputGroup.classList.add(
	'd-flex',
	'align-items-center',
	'border',
	'rounded',
	'border-1',
);
// Don't use class `border-0`. It uses !important,
// which fucks with the `::file-selector-button` border
fileInput.style.borderWidth = '0';
clearImageButton.classList.remove('d-none');

// Checkbox to delete image serverside
// Not necessary if JavaScript can clear the image
document.querySelector('#nojs-remove-image').classList.add('d-none');
removeInputName(document.querySelector('#remove-image'));

/** @type {{name: string, url: string, deletionKey: string | undefined} | undefined} */
let uploadedImage;

/**
 * @param {HTMLInputElement} input
 */
function removeInputName(input) {
	input.dataset.name = input.name;
	input.name = '';
}

/**
 * @param {HTMLInputElement} input
 */
function resetInputName(input) {
	input.name = input.dataset.name ?? input.name;
}

function handleClearImage() {
	uploadedImageInput.value = '';

	imagePreview.src = '';
	imagePreviewParent.classList.add('d-none');
	resetInputName(fileInput);

	uploadAbortController?.abort();
	void deleteImage();
}

/**
 * @param {File} file
 * @param {AbortSignal} signal
 * @returns {Promise<string | true>} true is success, string is the error
 */
async function uploadImage(file, signal) {
	const body = new FormData();
	body.set('image', file);
	body.set('csrf-token', csrfTokenInput.value);

	try {
		const response = await fetch('/api/temp-image/upload', {
			method: 'POST',
			body,
			signal,
		});

		csrfTokenInput.value =
			response.headers.get('X-CSRF-Token') || csrfTokenInput.value;

		const json = await response.json();
		if ('error' in json) {
			uploadedImage = undefined;
			return json['error'];
		}

		uploadedImage = json;
		return true;
	} catch (error) {
		return `Could not upload image: ${error.message}`;
	}
}

async function deleteImage() {
	const deletionKey = uploadedImage?.deletionKey;
	if (deletionKey) {
		uploadedImage.deletionKey = undefined;

		const body = new FormData();
		body.set('deletion-key', deletionKey);
		body.set('csrf-token', csrfTokenInput.value);

		try {
			const response = await fetch('/api/temp-image/delete', {
				body,
				method: 'POST',
			});
			csrfTokenInput.value =
				response.headers.get('X-CSRF-Token') || csrfTokenInput.value;
			await response.text();
		} catch {
			// Doesn't matter if it couldn't be deleted
			// server will just delete it another time
		}
	}
}

/**
 * @param {'success' | 'uploading' | 'error'} type
 */
function setImagePreviewVisibilities(type) {
	imagePreviewParent.classList.remove('d-none');

	imagePreviewSpinner.classList.toggle('d-none', type !== 'uploading');
	imageUploadError.classList.toggle('d-none', type !== 'error');
	imagePreview.classList.toggle('d-none', type !== 'success');
}

/**
 * @param {string} url
 */
function showUploadSuccess() {
	setImagePreviewVisibilities('success');
	imagePreview.src = uploadedImage.url;

	uploadedImageInput.value = uploadedImage.name;
	removeInputName(fileInput);
}

function showUploading() {
	setImagePreviewVisibilities('uploading');
}

function showUploadError(error) {
	setImagePreviewVisibilities('error');
	imageUploadError.textContent = error;
}

/** @type {AbortController | undefined} */
let uploadAbortController;
/**
 * @param {File} file
 */
async function handleImageInput(file) {
	uploadAbortController?.abort();
	uploadAbortController = new AbortController();

	showUploading();

	const result = await uploadImage(file, uploadAbortController.signal);
	if (result === true) {
		showUploadSuccess();
	} else {
		showUploadError(result);
	}
}

fileInput.addEventListener('input', () => {
	const file = fileInput.files?.[0];
	handleClearImage();

	if (file) {
		void handleImageInput(file);
	}
});

function handleClearImageButtonInput() {
	fileInput.value = '';
	handleClearImage();
}
clearImageButton.addEventListener('click', () => {
	handleClearImageButtonInput();
});
clearImageButton.addEventListener('keypress', event => {
	const code = event.code.toLowerCase();
	if (code === 'enter' || code === 'space') {
		handleClearImageButtonInput();
	}
});
