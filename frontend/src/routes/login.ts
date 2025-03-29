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
import {$} from '../$.js';
import {centeredMain} from '../components/centered-main.js';

import {createRoute} from './_utilities.js';

export const renderLogin = createRoute(
	'Login',
	(_user, csrfToken: string, error: string | undefined) =>
		centeredMain($`
			<section>
				<h2>Login</h2>
				<form
					method="POST"
					enctype="multipart/form-data"
					class="d-flex flex-column gap-2"
				>
					${
						error &&
						$`<div class="alert alert-danger" role="alert">
							${error}
						</div>`
					}

					<input type="hidden" name="csrf-token" value="${csrfToken}">

					<div>
						<label for="username" class="form-label">Username</label>
						<input
							type="text"
							class="form-control"
							id="username"
							name="username"
						>
					</div>
					<div class="mb-2">
						<label for="password" class="form-label">Password</label>
						<input
							type="password"
							class="form-control"
							id="password"
							name="password"
						>
					</div>

					<button type="submit" class="btn btn-primary">Login</button>
				</form>
			</section>
		`),
);
