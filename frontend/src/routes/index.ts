import type {Recipe, User} from 'api';

import {$} from '../$.js';
import {recipeCard, smallAuthor} from '../components/index.js';

import {createRoute, type Route} from './_utilities.js';

export const renderIndex: Route<
	[readonly InstanceType<User>[], readonly InstanceType<Recipe>[]]
> = createRoute(
	'Recipes',
	(users, recipes) => $`
		${users.map(user => smallAuthor(user))}

		<div class="row">
			${recipes.map(
				recipe => $`
				<div class="col-sm-6">
					${recipeCard(recipe)}
				</div>
			`,
			)}
		</div>
	`,
);
