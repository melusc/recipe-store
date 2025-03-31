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

function jsTag(value?: string) {
	return $`
		<div
			id="tag-parent"
			class="
				btn btn-primary
				d-flex flex-row align-items-center
				g-col-12 g-col-sm-6 g-col-lg-3
			"
		>
			<input
				type="text"
				name="tags-js"
				class="bg-transparent border-0 w-100"
				value="${value}"
			>
			<button
				type="button"
				aria-label="Remove tag"
				class="btn p-0"
				id="btn-remove-tag"
				style="width: 1em; height: 1em"
			>
				${iconCross()}
			</button>
		</div>`;
}

export function recipeTagsInput(tags?: readonly string[]) {
	tags ??= [];

	return $`
		<div id="tags-nojs-parent">
			<label for="tags-nojs" class="form-label">Tags (optional)</label>
			<input
				type="text"
				name="tags-nojs"
				id="tags-nojs"
				placeholder="Enter comma separated tags"
				class="form-control"
				value="${tags.join(', ')}"
				autocomplete="off"
			/>
		</div>
		<div class="d-none" id="js-tags">
			<label for="tags-input" class="form-label">Tags (optional)</label>
			<template id="tag-template">
				${jsTag()}
			</template>
			<div class="
				border border-1 rounded p-2
				grid gap-2
			">
				${tags.map(tag => jsTag(tag))}
				<input
					class="border-0 form-control g-col-12"
					type="text"
					id="tags-input"
					placeholder="Enter comma separated tags"
					autocomplete="off"
				/>
			</div>
		</div>

		<script src="/static/progressive-enhancement/recipe-tags-input.js"></script>
	`;
}
