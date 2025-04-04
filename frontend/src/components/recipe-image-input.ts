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

import {$} from '../$.js';

import {iconCross} from './icons/cross.js';

export function recipeImageInput(prefillImage: string | undefined) {
	const imageUrl = prefillImage && `/static/user-content/${prefillImage}`;

	return $`
		<div id="image-preview-parent" class="${!prefillImage && 'd-none'}">
			<div id="image-preview-spinner" class="spinner-border text-primary d-none" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>

			<div id="image-upload-error" class="alert alert-danger d-none"></div>

			<img
				id="image-preview-image"
				class="image-fluid rounded w-100 ${!prefillImage && 'd-none'}"
				src="${imageUrl}"
			>
		</div>

		<div>
			<label for="file-image" class="form-label">Image (optional)</label>
			<div id="clearable-file-input-group">
				<input
					class="form-control"
					type="file"
					accept="image/png, image/jpeg, image/webp"
					id="file-image"
					name="file-image"
					data-name="file-image"
					autocomplete="off"
				>
				<button
					id="js-remove-image"
					type="button"
					class="d-none btn p-0 me-2"
					style="width: 1em; height: 1em"
				>${iconCross()}</button>
			</div>
			<input
				type="hidden"
				name="uploaded-image"
				id="uploaded-image"
				value="${prefillImage}"
				autocomplete="off"
			>

			<div class="form-check" id="nojs-remove-image">
				<label for="remove-image" class="form-check-label">Remove image</label>
				<input
					type="checkbox"
					class="form-check-input"
					name="remove-image"
					id="remove-image"
					autocomplete="off"
				>
			</div>
		</div>

		<script src="/static/progressive-enhancement/recipe-form-image.js"></script>
	`;
}
