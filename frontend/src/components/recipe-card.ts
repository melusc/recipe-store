import type {Recipe} from 'api';

import {$} from '../$.js';

import {smallAuthor} from './author.js';
import {recipeTagList} from './recipe-tag.js';

export function recipeCard(recipe: InstanceType<Recipe>) {
	const imageUrl =
		(recipe.image && `/api/user-content/images/${recipe.image}`) ||
		`https://picsum.photos/${String(Math.floor(Math.random() * 200 + 400))}/${String(Math.floor(Math.random() * 200 + 400))}`;

	return $`<div class="card shadow-sm">
		${
			imageUrl &&
			$`
			<a href="/recipe/${String(recipe.recipeId)}">
				<img
					class="card-img-top object-fit-cover"
					style="height: 200px"
					src="${imageUrl}"
					alt="Photo of ${recipe.title}"
				>
			</a>
		`
		}

		<div class="card-body">
			<h5 class="card-title">
				<a href="/recipe/${String(recipe.recipeId)}">
					${recipe.title}
				</a>
			</h5>

			<p class="small">
				By ${smallAuthor(recipe.author)} from
				<time datetime="${recipe.updatedAt.toISOString()}">
					${recipe.updatedAt.toDateString()}
				</time>
			</p>

			${recipeTagList(recipe.tags)}
		</div>
	</div>`;
}
