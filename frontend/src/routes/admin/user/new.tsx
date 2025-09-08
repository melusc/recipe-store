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

import {UserRoles, UserRolesLabels, type User} from 'api';

import {CenteredMain} from '../../../components/centered-main.js';
import {FormError} from '../../../components/form-error.js';
import {PasswordResetCopy} from '../../../components/password-reset-copy.js';
import {createRoute} from '../../_utilities.js';

export const renderAdminNewUser = createRoute(
	({requestUser: user, csrfToken}, errors?: string[]) => {
		const allowedRoles: ReadonlyArray<keyof typeof UserRoles> =
			user && user.role === UserRoles.Owner ? [...UserRolesLabels] : ['User'];

		return {
			title: 'Create New User',
			body: (
				<CenteredMain>
					<section>
						<form
							method="POST"
							enctype="multipart/form-data"
							class="d-flex flex-column gap-3"
						>
							<input
								type="hidden"
								name="csrf-token"
								value={csrfToken}
								autocomplete="off"
							/>

							<FormError errors={errors} />

							<div>
								<label for="username" class="form-label">
									Username:
								</label>
								<input
									type="text"
									class="form-control"
									id="username"
									name="username"
									minlength={4}
									required
								/>
							</div>

							<div>
								<label for="role" class="form-label">
									Role:
								</label>
								<select class="form-select" name="role" aria-label="User role">
									{allowedRoles.map(role => (
										<option value={role}>{role}</option>
									))}
								</select>
							</div>

							<button type="submit" class="btn btn-primary">
								Create
							</button>
						</form>
					</section>
				</CenteredMain>
			),
		};
	},
);

export const renderAdminNewUserResult = createRoute(
	(_, user: User, password: string) => ({
		title: 'Create New User',
		body: (
			<CenteredMain>
				<section>
					<div class="alert alert-success" role="alert">
						Successfully created user {user.username}
					</div>

					<PasswordResetCopy password={password} />

					<a href={`/user/${user.userId}`} class="btn btn-primary">
						Continue to profile
					</a>
				</section>
			</CenteredMain>
		),
	}),
);
