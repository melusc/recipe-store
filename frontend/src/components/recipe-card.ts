import type {Recipe} from 'api';

import {$} from '../$.js';

export function recipeCard(recipe: InstanceType<Recipe>) {
	const imageUrl = recipe.image && `/api/user-content/images/${recipe.image}`;

	return $`<div class="card">
		${imageUrl && `<img class="card-img-top" src="${imageUrl}" alt="Photo of ${recipe.title}">`}

		<div class="card-body">
			<h5 class="card-title">
				<a href="/recipe/${String(recipe.recipeId)}">
					${recipe.title}
				</a>
			</h5>
		</div>
	</div>`;
}
