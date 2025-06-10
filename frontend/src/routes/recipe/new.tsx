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

import {CenteredMain} from '../../components/centered-main.js';
import {RecipeForm, type RecipePrefill} from '../../components/recipe-form.js';
import {createRoute} from '../_utilities.js';

export const renderNewRecipe = createRoute(
	({csrfToken}, prefill: RecipePrefill, errors?: readonly string[]) => ({
		title: 'New Recipe',
		body: (
			<CenteredMain>
				<section>
					<h1>Create a new recipe</h1>

					<RecipeForm
						csrfToken={csrfToken}
						prefill={prefill}
						action="Submit"
						errors={errors}
					/>
				</section>
			</CenteredMain>
		),
	}),
);
