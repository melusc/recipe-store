/*!
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

import type {Recipe} from 'api';

import {$} from '../$.js';

import {smallAuthor} from './author.js';
import {recipeTagList} from './recipe-tag.js';

export function recipeCard(recipe: InstanceType<Recipe>) {
	const imageUrl =
		(recipe.image && `/api/user-content/images/${recipe.image}`) ||
		`https://picsum.photos/${String(Math.floor(Math.random() * 200 + 400))}/${String(Math.floor(Math.random() * 200 + 400))}`;

	return $`<div class="card shadow-sm">
		${
			imageUrl &&
			$`
			<a href="/recipe/${String(recipe.recipeId)}">
				<img
					class="card-img-top object-fit-cover"
					style="height: 200px"
					src="${imageUrl}"
					alt="Photo of ${recipe.title}"
				>
			</a>
		`
		}

		<div class="card-body">
			<h5 class="card-title">
				<a href="/recipe/${String(recipe.recipeId)}">
					${recipe.title}
				</a>
			</h5>

			<p class="small">
				By ${smallAuthor(recipe.author)} from
				<time datetime="${recipe.updatedAt.toISOString()}">
					${recipe.updatedAt.toDateString()}
				</time>
			</p>

			${recipeTagList(recipe.tags)}
		</div>
	</div>`;
}
