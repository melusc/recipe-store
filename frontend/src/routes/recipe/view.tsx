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
import type {ComponentChild} from 'preact';

import {SmallAuthor} from '../../components/author.js';
import {EditRecipeButton} from '../../components/buttons/edit-recipe.js';
import {CenteredMain} from '../../components/centered-main.js';
import {RecipeTable} from '../../components/recipe-table.js';
import {RecipeTagList} from '../../components/recipe-tag.js';
import {createRoute} from '../_utilities.js';

export const renderViewRecipe = createRoute(
	(_, recipe: Recipe, hasEditPermissions: boolean) => {
		const metadataTable: Array<[string, ComponentChild]> = [
			['Author', <SmallAuthor author={recipe.author} />],
			[
				'Last update',
				<time data-display="date" datetime={recipe.updatedAt.toISOString()}>
					{recipe.updatedAt.toDateString()}
				</time>,
			],
		];

		if (recipe.duration) {
			metadataTable.push(['Duration', <span>{recipe.duration}</span>]);
		}

		if (recipe.source) {
			const {source} = recipe;
			const url = URL.canParse(source) && new URL(source);
			if (url && (url.protocol === 'http:' || url.protocol === 'https:')) {
				metadataTable.push([
					'Source',
					<a href={source} rel="nofollow noreferrer noopener">
						{source}
					</a>,
				]);
			} else {
				metadataTable.push(['Source', <span>{recipe.source}</span>]);
			}
		}

		const imageUrl =
			recipe.image && `/static/user-content/${recipe.image.name}`;

		return {
			title: recipe.title,
			body: (
				<CenteredMain>
					{imageUrl && (
						<img
							class="object-fit-cover w-100 rounded"
							style="max-height: 500px;"
							src={imageUrl}
							alt={`Photo of ${recipe.title}`}
						/>
					)}
					<h1>{recipe.title}</h1>

					<div class="col-12 mb-3">
						{metadataTable.map(([name, value]) => (
							<div class="grid gap-3 border-bottom border-1 border-dark-subtle px-2">
								<div class="g-col-4">{name}</div>
								<div class="g-col-8">{value}</div>
							</div>
						))}
					</div>

					<h2>Instructions</h2>

					<RecipeTable recipe={recipe} />

					{recipe.tags.length > 0 && (
						<>
							<h2 class="mt-3">Tags</h2>
							<RecipeTagList tags={recipe.tags} />
						</>
					)}

					{hasEditPermissions && (
						<EditRecipeButton recipeId={recipe.recipeId} />
					)}
				</CenteredMain>
			),
		};
	},
);
