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

import {$} from '../$.js';

import {createRoute} from './_utilities.js';

export const renderAccountDelete = createRoute(
	'Delete Account',
	(_user, csrfToken: string, error?: string) => $`
		<main class="
			col-sm-10 col-md-6 col-lg-4
			align-self-center
		">
			<section>
				<h1>Delete Account</H1>

				<form
					enctype="multipart/form-data"
					method="POST"
					action="/account/delete"
					class="d-flex flex-column gap-3"
					id="account-delete-form"
				>
					${
						error &&
						$`<div class="alert alert-danger" role="alert">
							${error}
						</div>`
					}

					<input type="hidden" name="csrf-token" value="${csrfToken}">

					<div class="form-check">
						<input
							class="form-check-input"
							type="checkbox"
							id="delete-recipes"
							name="delete-recipes"
						>
						<label class="form-check-label" for="delete-recipes">
							Delete your recipes?
						</label>
					</div>


					<div>
						<label for="password" class="form-label">Confirm password:</label>
						<input
							type="password"
							class="form-control"
							id="password"
							name="password"
							required
						>
					</div>

					<button type="submit" class="btn btn-danger">Permanently delete account</button>
				</form>
			</section>
		</main>
	`,
);
