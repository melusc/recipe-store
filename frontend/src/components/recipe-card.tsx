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

import type {Recipe} from 'api';

import {SmallAuthor} from './author.js';
import {RecipeTagList} from './recipe-tag.js';

export function RecipeCard({
	recipe,
	small = false,
}: {
	recipe: Recipe;
	small?: boolean;
}) {
	return (
		<div class={small ? 'col-md-12 col-lg-6' : 'col-md-6 col-lg-3'}>
			<div class="card shadow-sm">
				{recipe.image && (
					<a href={`/recipe/${recipe.recipeId}`}>
						<img
							class="card-img-top object-fit-cover"
							style={{
								height: 200,
							}}
							src={`/static/user-content/${recipe.image.name}`}
							alt={`Photo of ${recipe.title}`}
						/>
					</a>
				)}

				<div class="card-body">
					<h5 class="card-title">
						<a href={`/recipe/${recipe.recipeId}`} class="text-dark">
							{recipe.title}
						</a>
					</h5>

					<p class="small">
						By <SmallAuthor author={recipe.author} /> from{' '}
						<time datetime={recipe.updatedAt.toISOString()} data-display="date">
							{recipe.updatedAt.toDateString()}
						</time>
					</p>

					<RecipeTagList tags={recipe.tags} />
				</div>
			</div>
		</div>
	);
}
