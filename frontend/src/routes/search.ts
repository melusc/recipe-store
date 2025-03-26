/*!
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

import {RelativeUrl} from '@lusc/util/relative-url';
import {type DynamicPaginationResult, type Recipe} from 'api';

import {$} from '../$.js';
import {pagination} from '../components/pagination.js';
import {recipeCard} from '../components/recipe-card.js';
import {searchForm} from '../components/search-form.js';

import {createRoute} from './_utilities.js';

export const renderSearch = createRoute<
	| [query: undefined, recipes: undefined]
	| [query: string, recipes: DynamicPaginationResult<Recipe>]
>('Search', (_user, query, recipes) => {
	if (query === undefined) {
		return $`
			<main>
				${searchForm('inline')}
			</main>
		`;
	}

	const paginationBaseUrl = new RelativeUrl('/search');
	paginationBaseUrl.searchParams.set('q', query);
	const paginationButtons = pagination(paginationBaseUrl, recipes!);

	if (recipes!.items.length === 0) {
		return $`
			<main>
				${searchForm('inline', query)}
			</main>

			${paginationButtons}
		`;
	}

	return $`
		<main class="row g-3">
			${searchForm('inline', query)}

			${recipes!.items.map(recipe => recipeCard(recipe))}
		</main>

		${paginationButtons}
	`;
});
