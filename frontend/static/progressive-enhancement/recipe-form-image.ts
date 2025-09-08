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
const imagePreviewParent = document.querySelector<HTMLElement>(
	'#image-preview-parent',
)!;
const imagePreviewSpinner = document.querySelector<HTMLElement>(
	'#image-preview-spinner',
)!;
const imagePreview = document.querySelector<HTMLImageElement>(
	'#image-preview-image',
)!;
const imageUploadError = document.querySelector<HTMLElement>(
	'#image-upload-error',
)!;

const uploadedImageInput =
	document.querySelector<HTMLInputElement>('#uploaded-image')!;

// Elements for the input type="file" and button to clear input
const clearableFileInputGroup = document.querySelector<HTMLElement>(
	'#clearable-file-input-group',
)!;
const fileInput = document.querySelector<HTMLInputElement>('#file-image')!;
const clearImageButton =
	document.querySelector<HTMLButtonElement>('#js-remove-image')!;

const csrfTokenInput = document.querySelector<HTMLInputElement>(
	'input[name="csrf-token"]',
)!;

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
document.querySelector('#nojs-remove-image')!.classList.add('d-none');
removeInputName(document.querySelector('#remove-image')!);

type UploadedImage = {
	name: string;
	url: string;
	deletionKey: string | undefined;
};

let uploadedImage: UploadedImage | undefined;

function removeInputName(input: HTMLInputElement) {
	input.dataset['name'] = input.name;
	input.name = '';
}

function resetInputName(input: HTMLInputElement) {
	input.name = input.dataset['name'] ?? input.name;
}

function handleClearImage() {
	uploadedImageInput.value = '';

	imagePreview.src = '';
	imagePreviewParent.classList.add('d-none');
	resetInputName(fileInput);

	uploadAbortController?.abort();
	void deleteImage();
}

async function uploadImage(
	file: File,
	signal: AbortSignal,
): Promise<string | true> {
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

		const json = (await response.json()) as
			| {
					error: string;
			  }
			| UploadedImage;
		if ('error' in json) {
			uploadedImage = undefined;
			return json['error'];
		}

		uploadedImage = json;
		return true;
	} catch (error: unknown) {
		return `Could not upload image: ${(error as Error).message}`;
	}
}

async function deleteImage() {
	const deletionKey = uploadedImage?.deletionKey;
	if (deletionKey) {
		uploadedImage!.deletionKey = undefined;

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

function setImagePreviewVisibilities(type: 'success' | 'uploading' | 'error') {
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
	imagePreview.src = uploadedImage!.url;

	uploadedImageInput.value = uploadedImage!.name;
	removeInputName(fileInput);
}

function showUploading() {
	setImagePreviewVisibilities('uploading');
}

function showUploadError(error: string) {
	setImagePreviewVisibilities('error');
	imageUploadError.textContent = error;
}

let uploadAbortController: AbortController | undefined;
async function handleImageInput(file: File) {
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
