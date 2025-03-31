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

import {formError} from './form-error.js';
import {recipeImageInput} from './recipe-image-input.js';
import {recipeSectionsInput} from './recipe-sections-input.js';
import {recipeTagsInput} from './recipe-tags-input.js';

export type RecipePrefill = {
	readonly title?: string;
	readonly source?: string | undefined;
	readonly duration?: string | undefined;
	readonly image?: string | undefined;
	readonly tags?: readonly string[];
	readonly sections?: readonly string[];
};

export function recipeForm(
	postUrl: string,
	csrfToken: string,
	prefill: RecipePrefill,
	errors?: readonly string[],
) {
	return $`
		<form
			method="POST"
			enctype="multipart/form-data"
			action="${postUrl}"
			class="d-flex flex-column gap-3"
		>
			${formError(errors)}

			<input type="hidden" name="csrf-token" value="${csrfToken}" autocomplete="off">

			<div>
				<label for="title">Recipe Title</label>
				<input
					type="text"
					name="title"
					id="title"
					value="${prefill.title}"
					class="form-control"
				>
			</div>

			${recipeImageInput(prefill.image)}

			<div>
				<label for="source">Source (optional)</label>
				<input
					type="text"
					name="source"
					id="source"
					value="${prefill.source}"
					class="form-control"
				/>
			</div>

			<div>
				<label for="duration">Duration to cook / bake (optional)</label>
				<input
					type="text"
					name="duration"
					id="duration"
					value="${prefill.duration}"
					class="form-control"
				/>
			</div>

			${recipeTagsInput(prefill.tags)}

			${recipeSectionsInput(prefill.sections)}

			<button type="submit" class="btn btn-primary">
				Submit
			</button>
		</form>
	`;
}
