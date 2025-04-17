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

import {UserRolesLabels, type User} from 'api';

import {$} from '../$.js';

import {formError} from './form-error.js';
import {passwordRequirements} from './password-requirements.js';

export function accountEditForm(
	requestUser: User,
	user: User,
	csrfToken: string,
	adminForm: boolean,
	showSuccess: boolean,
	errors?: readonly string[],
) {
	return $`
		<form
			enctype="multipart/form-data"
			method="POST"
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
				<label for="username" class="form-label">Username:</label>
				<input
					type="text"
					class="form-control"
					id="username"
					name="username"
					minlength="4"
					required
					value="${user.username}"
				>
			</div>

			<div>
				<label for="displayname" class="form-label">Display name:</label>
				<input
					type="text"
					class="form-control"
					id="displayname"
					name="displayname"
					minlength="4"
					required
					value="${user.displayName}"
				>
			</div>

			${
				adminForm &&
				requestUser.permissionToChangeRole(user) &&
				$`
					<div>
						<label for="role" class="form-label">Role:</label>
						<select class="form-select" name="role" aria-label="Change user role">
							${[...UserRolesLabels].map(
								role => $`
									<option
										value="${role}"
										${user.roleLabel === role && $`selected`}
									>
										${role}
									</option>
								`,
							)}
						</select>
					</div>

					<div class="form-check">
						<input
							class="form-check-input"
							type="checkbox"
							id="require-pw-change"
							name="require-pw-change"
							${user.requirePasswordChange && $`checked`}
						>
						<label class="form-check-label" for="require-pw-change">
							User required to change password?
						</label>
					</div>
				`
			}

			${
				!adminForm &&
				$`
					${passwordRequirements(false)}

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

					<script src="/static/progressive-enhancement/password-form.js"></script>
				`
			}

			<button type="submit" class="btn btn-primary">Save</button>

			${
				adminForm &&
				$`
					<input
						class="btn btn-secondary"
						type="submit"
						name="reset-password"
						value="Reset password"
					>
				`
			}
		</form>

	`;
}
