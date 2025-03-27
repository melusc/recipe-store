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

import {makeSlug} from '@lusc/util/slug';

import {$} from '../$.js';

export function recipeTag(tagName: string) {
	const slug = makeSlug(tagName, {appendRandomHex: false});

	return $`<a
		href="/tag/${slug}"
		class="badge shadow-sm bg-theme"
	>
		${tagName}
	</a>`;
}

export function recipeTagList(tags: readonly string[]) {
	return $`<p class="d-flex flex-wrap gap-2">
		${tags.map(tag => recipeTag(tag))}
	</p>`;
}
