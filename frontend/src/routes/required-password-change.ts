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
import {passwordRequirements} from '../components/password-requirements.js';

import {createRoute} from './_utilities.js';

export const renderRequiredPasswordChange = createRoute(
	(_, csrfToken: string, errors?: string[]) => ({
		title: 'Change Password',
		body: centeredMain($`
			<section>
				<h1>Please change your password</H1>

				<form
					enctype="multipart/form-data"
					method="POST"
					class="d-flex flex-column gap-3"
					id="account-form"
				>
					${formError(errors)}

					<input type="hidden" name="csrf-token" value="${csrfToken}">

					${passwordRequirements(true)}

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

				<script src="/static/progressive-enhancement/password-form.js"></script>
			</section>
		`),
	}),
);
