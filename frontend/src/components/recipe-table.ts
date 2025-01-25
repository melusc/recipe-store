import type {Recipe} from 'api';
import {sectionToText} from 'cooklang';

import {$} from '../$.js';

export function recipeTable(recipe: InstanceType<Recipe>) {
	return $`<div class="recipe-table">${recipe.sections.map(
		section => $`
			<div class="recipe-step">
				${sectionToText(section.parsed)}
			</div>
		`,
	)}</div>`;
}
