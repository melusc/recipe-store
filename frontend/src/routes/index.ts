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

import {type PaginationResult, type Recipe} from 'api';

import {$} from '../$.js';
import {createRecipeButton} from '../components/buttons/create-recipe.js';
import {pagination} from '../components/pagination.js';
import {recipeCard} from '../components/recipe-card.js';

import {createRoute} from './_utilities.js';

export const renderIndex = createRoute(
	({requestUser: user}, recipes: PaginationResult<Recipe>) => ({
		title: 'Recipes',
		body: $`
			${user && createRecipeButton()}

			${
				recipes.items.length > 0 &&
				$`<main class="row g-3">
					${recipes.items.map(recipe => recipeCard(recipe))}
				</main>`
			}

			${pagination('/', recipes)}
		`,
	}),
);
