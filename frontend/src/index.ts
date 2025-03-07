import {readFile} from 'node:fs/promises';

import type {Recipe, User} from 'api';

import {$} from './$.js';
import {header, recipeCard, smallAuthor} from './components/index.js';

// eslint-disable-next-line security/detect-non-literal-fs-filename
const baseHtml = await readFile(
	new URL('../src/base.html', import.meta.url),
	'utf8',
);

export function renderIndex(
	users: readonly InstanceType<User>[],
	recipes: readonly InstanceType<Recipe>[],
) {
	return $`
		${$.trusted(baseHtml)}
		${header(false)}

		${users.map(user => smallAuthor(user))}

		${recipes.map(recipe => recipeCard(recipe))}
	`;
}
