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

import type {PaginationResult, Recipe, User} from 'api';

import {EditUserButton} from '../components/buttons/edit-user.js';
import {CenteredMain} from '../components/centered-main.js';
import {Pagination} from '../components/pagination.js';
import {RecipeCard} from '../components/recipe-card.js';

import {createRoute} from './_utilities.js';

export const renderUser = createRoute(
	(
		_,
		user: User,
		userRecipes: PaginationResult<Recipe>,
		showAdminModify: boolean,
	) => {
		return {
			title: user.displayName,
			body: (
				<CenteredMain>
					<h1>{user.displayName}</h1>

					{showAdminModify && (
						<EditUserButton url={`/admin/user/${user.userId}`} />
					)}

					{userRecipes.items.length > 0 && (
						<section class="row g-3">
							<h2>Recipes</h2>
							{userRecipes.items.map(recipe => (
								<RecipeCard recipe={recipe} small />
							))}
						</section>
					)}

					<Pagination
						baseUrl={`/user/${user.userId}`}
						paginationResult={userRecipes}
					/>
				</CenteredMain>
			),
		};
	},
);
