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

import type {User} from 'api';

import {$} from '../../../$.js';
import {accountEditForm} from '../../../components/account-edit-form.js';
import {centeredMain} from '../../../components/centered-main.js';
import {iconCopy} from '../../../components/icons/copy.js';
import {createRoute} from '../../_utilities.js';

export const renderAdminEditUser = createRoute(
	(
		{requestUser, csrfToken},
		user: User,
		showSuccess: boolean,
		errors?: readonly string[],
		newPassword?: string,
	) => ({
		title: `Edit ${user.username} - Admin`,
		body: centeredMain($`
			<section>
				<h1>Account ${user.username}</H1>

				${
					newPassword !== undefined &&
					$`
						<div class="mb-3">
							<label class="form-label">New password (Copy this! You won't see it again)</label>
							<div
								style="width: max-content"
								class="form-control d-flex align-items-center"
							>
								<pre class="m-0" id="reset-password">${newPassword}</pre>
								<button
									class="btn btn-outline-secondary ms-2 d-flex w-auto h-auto"
									data-copy
									data-target="#reset-password"
									style="width: 1em;height: 1em;"
								>
									${iconCopy('1em')}
								</button>
							</div>
							<script src="/static/progressive-enhancement/copy-button.js"></script>
						</div>
					`
				}

				${accountEditForm(requestUser!, user, csrfToken, true, showSuccess, errors)}

				<a
					href="/admin/user/${String(user.userId)}/delete"
					class="btn btn-danger w-100 mt-3"
				>
					Delete Account
				</a>
			</section>
		`),
	}),
);
