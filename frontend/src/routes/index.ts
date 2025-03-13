import type {Recipe} from 'api';

import {$} from '../$.js';
import {recipeCard} from '../components/index.js';

import {createRoute, type Route} from './_utilities.js';

export const renderIndex: Route<[readonly InstanceType<Recipe>[]]> =
	createRoute(
		'Recipes',
		recipes => $`
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
