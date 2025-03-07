import type {Recipe} from 'api';

import {$} from '../$.js';

export function recipeCard(recipe: InstanceType<Recipe>) {
	const imageUrl = recipe.image && `/api/user-content/images/${recipe.image}`;

	return $`<div class="recipe-card">
		${imageUrl && `<img class="recipe-card-photo" src="${imageUrl}">`}

		<h3>${recipe.title}</h3>
	</div>`;
}
