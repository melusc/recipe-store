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
import {
	ingredientToText,
	sectionToText,
	stringifyQuantity,
	type CooklangSection,
} from 'cooklang';

import {$} from '../$.js';

function recipeRow(section: CooklangSection) {
	return $`
		<div class="
			grid gap-0
			border-bottom border-1 border-dark-subtle
		">
			<div class="g-col-4 p-2">
				${section.ingredients.map(
					ingredient =>
						$`<div class="grid gap-0">
							<div class="g-col-4">${ingredient.quantity && stringifyQuantity(ingredient.quantity)}</div>
							<div class="g-col-8">${ingredientToText(ingredient, false)}</div>
						</div>`,
				)}
			</div>
			<div class="g-col-8 p-2 border-1 border-start border-dark-subtle">
				${sectionToText(section)}
			</div>
		</div>
	`;
}

export function recipeTable(recipe: Recipe) {
	return $`<div class="border-top border-1 border-dark-subtle">
		${recipe.sections.map(section => recipeRow(section.parsed))}
	</div>`;
}
