import type {Recipe, User} from 'api';

import {$} from './$.js';
import {header, recipeTable, smallAuthor} from './components/index.js';

function boilerplate() {
	return $`
		<!doctype html>

		<link rel="stylesheet" href="/static/css/sanitise.css" />
		<link rel="stylesheet" href="/static/css/main.css" />
	`;
}

export function renderIndex(
	users: readonly InstanceType<User>[],
	recipes: readonly InstanceType<Recipe>[],
) {
	return $`
		${boilerplate()}
		${header(false)}

		${users.map(user => smallAuthor(user))}

		${recipes.map(recipe => recipeTable(recipe))}
	`;
}
