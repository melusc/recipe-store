/*!
	Copyright 2025 Luca Schnellmann <oss@lusc.ch>

	This file is part of recipe-store.

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
import type {DynamicPaginationResult, Recipe} from 'api';

import {Pagination} from '../components/pagination.js';
import {RecipeCard} from '../components/recipe-card.js';
import {SearchForm} from '../components/search-form.js';

import {createRoute} from './_utilities.js';

export const renderSearch = createRoute<
	| [query: undefined, recipes: undefined]
	| [query: string, recipes: DynamicPaginationResult<Recipe>]
>((_, query, recipes) => {
	if (query === undefined) {
		return {
			title: 'Search',
			body: (
				<main>
					<SearchForm location="inline" />
				</main>
			),
		};
	}

	const paginationBaseUrl = new RelativeUrl('/search');
	paginationBaseUrl.searchParams.set('q', query);
	const paginationButtons = (
		<Pagination baseUrl={paginationBaseUrl} paginationResult={recipes!} />
	);

	if (recipes!.items.length === 0) {
		return {
			title: query,
			body: (
				<>
					<main>
						<SearchForm location="inline" prefillQuery={query} />
					</main>

					{paginationButtons}
				</>
			),
		};
	}

	return {
		title: query,
		body: (
			<>
				<main class="row g-3">
					<SearchForm location="inline" prefillQuery={query} />

					{recipes!.items.map(recipe => (
						<RecipeCard recipe={recipe} />
					))}
				</main>

				{paginationButtons}
			</>
		),
	};
});
