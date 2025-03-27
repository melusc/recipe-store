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

export function recipeTagsInput(tags?: string[]) {
	tags ??= [];

	return $`
		<div id="no-js-tags">
			<label for="tags-no-js" class="form-label">Tags</label>
			<input
				type="text"
				name="tags-no-js"
				id="tags-no-js"
				placeholder="Enter comma separated tags"
				class="form-control"
				value="${tags.join(', ')}"
				autocomplete="off"
			/>
		</div>
		<div class="d-none" id="js-tags">
			<label for="tags-no-js" class="form-label">Tags</label>
			<div class="
				border border-1 rounded p-2
				d-flex flex-wrap gap-2
			">
				<input
					class="border-0 form-control w-auto flex-grow-1"
					type="text"
					id="tags-input"
					placeholder="Enter comma separated tags"
					value="${tags.join(', ')}"
					autocomplete="off"
				/>
			</div>
		</div>

		<script src="/static/progressive-enhancement/recipe-tags-input.js"></script>
	`;
}
