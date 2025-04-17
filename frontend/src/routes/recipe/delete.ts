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

import type {Recipe} from 'api';

import {$} from '../../$.js';
import {centeredMain} from '../../components/centered-main.js';
import {createRoute} from '../_utilities.js';

export const renderRecipeDelete = createRoute(
	({csrfToken}, recipe: Recipe, error?: string) => ({
		title: `Delete ${recipe.title}`,
		body: centeredMain($`
			<section>
				<h1>Delete ${recipe.title}</H1>

				<form
					enctype="multipart/form-data"
					method="POST"
					class="d-flex flex-column gap-3"
					id="account-delete-form"
				>
					<input type="hidden" name="csrf-token" value="${csrfToken}">

					${
						error &&
						$`<div class="alert alert-danger" role="alert">
							${error}
						</div>`
					}

					<div class="alert alert-danger" role="alert">
						This cannot be undone!
					</div>

					<button type="submit" class="btn btn-danger">Permanently delete ${recipe.title}</button>
				</form>
			</section>
		`),
	}),
);
