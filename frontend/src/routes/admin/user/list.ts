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

import type {PaginationResult, User} from 'api';

import {$} from '../../../$.js';
import {centeredMain} from '../../../components/centered-main.js';
import {pagination} from '../../../components/pagination.js';
import {createRoute} from '../../_utilities.js';

export const renderAdminListUsers = createRoute(
	(_, users: PaginationResult<User>) => ({
		title: 'Users - Admin',
		body: centeredMain($`
			<table class="table table-striped">
				<thead>
					<tr>
						<th scope="col">#</th>
						<th scope="col">Username</th>
						<th scope="col">Role</th>
					</tr>
				</thead>
				<tbody>
					${users.items.map(
						user => $`
							<tr>
								<th scope="row">
									<a href="/admin/user/${String(user.userId)}">
										${String(user.userId)}
									</a>
								</th>
								<td>
									<a href="/admin/user/${String(user.userId)}">
										${user.username}</td>
									</a>
								<td>${user.roleLabel}</td>
							</tr>
						`,
					)}
				</tbody>
			</table>
			${pagination('/admin/users', users)}
		`),
	}),
);
