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
import {recipeCard} from '../components/index.js';

import {createRoute} from './_utilities.js';

export const renderIndex = createRoute(
	'Recipes',
	(recipes: readonly Recipe[]) => $`
		<div class="row g-3">
			${recipes.map(
				recipe => $`
				<div class="col-sm-3">
					${recipeCard(recipe)}
				</div>
			`,
			)}
		</div>
	`,
);
