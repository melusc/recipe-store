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
import {formError} from '../components/form-error.js';

import {createRoute} from './_utilities.js';

export const renderAccount = createRoute(
	'Account',
	(user, csrfToken: string, showSuccess: boolean, errors?: string[]) =>
		centeredMain($`
			<section>
				<h1>Account</H1>

				<form
					enctype="multipart/form-data"
					method="POST"
					action="/account"
					class="d-flex flex-column gap-3"
					id="account-form"
				>
					${formError(errors)}

					${
						showSuccess &&
						$`<div class="alert alert-success" role="alert">
							Changes saved successfully.
						</div>`
					}

					<input type="hidden" name="csrf-token" value="${csrfToken}">

					<div>
						<label for="username" class="form-label">New username:</label>
						<input
							type="text"
							class="form-control"
							id="username"
							name="username"
							minlength="4"
							required
							value="${user?.username}"
						>
					</div>

					<div>
						<label for="displayname" class="form-label">New display-name:</label>
						<input
							type="text"
							class="form-control"
							id="displayname"
							name="displayname"
							minlength="4"
							required
							value="${user?.displayName}"
						>
					</div>

					<div class="alert alert-info">
						<div>Leave password fields empty, if you don't want to change your password.</div>
						<div>New password must match the following criteria:</div>
						<ul>
							<li>Contains a special character</li>
							<li>Contains a number</li>
							<li>Contains a lowercase letter</li>
							<li>Contains an uppercase letter</li>
							<li>Is at least 10 characters long</li>
						</ul>
					</div>

					<div>
						<label for="current-password" class="form-label">Current password:</label>
						<input
							type="password"
							class="form-control"
							id="current-password"
							name="current-password"
						>
					</div>

					<div>
						<label for="new-password" class="form-label">New password:</label>
						<input
							type="password"
							class="form-control"
							id="new-password"
							name="new-password"
							minlength="10"
						>
					</div>

					<div>
						<label for="new-password-repeat" class="form-label">Repeat new password:</label>
						<input
							type="password"
							class="form-control"
							id="new-password-repeat"
							name="new-password-repeat"
							minlength="10"
						>
					</div>

					<button type="submit" class="btn btn-primary">Save</button>
				</form>

				<script src="/static/progressive-enhancement/account-form.js"></script>

				<a
					href="/account/delete"
					class="btn btn-danger w-100 mt-3"
				>
					Delete Account
				</a>
			</section>
		`),
);
