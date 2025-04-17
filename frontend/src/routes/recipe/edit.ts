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

import {$} from '../../$.js';
import {centeredMain} from '../../components/centered-main.js';
import {recipeForm, type RecipePrefill} from '../../components/recipe-form.js';
import {createRoute} from '../_utilities.js';

export const renderEditRecipe = createRoute(
	(
		{csrfToken},
		recipe: Recipe,
		prefill: RecipePrefill,
		errors?: readonly string[],
	) => ({
		title: `Edit ${recipe.title}`,
		body: centeredMain($`
			<section>
				<h1>Edit ${recipe.title}</h1>

				${recipeForm(csrfToken, prefill, 'Save', errors)}
				<a
					href="/recipe/${String(recipe.recipeId)}/delete"
					class="btn btn-danger w-100 mt-2"
				>Delete ${recipe.title}</a>
			</section>
		`),
	}),
);
