import type {Recipe, User} from 'api';

import {$} from './$.js';
import {header, recipeTable, smallAuthor} from './components/index.js';

export function renderIndex(
	users: readonly InstanceType<User>[],
	recipes: readonly InstanceType<Recipe>[],
) {
	return $`
		${header(false)}

		${users.map(user => smallAuthor(user))}

		${recipes.map(recipe => recipeTable(recipe))}
	`;
}
