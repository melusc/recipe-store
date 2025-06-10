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

import {CenteredMain} from '../../components/centered-main.js';
import {createRoute, type RouteCommon} from '../_utilities.js';

import {renderAdminBackup} from './backup.js';
import {renderAdminEditUser} from './user/edit.js';
import {renderAdminListUsers} from './user/list.js';
import {renderAdminNewUser, renderAdminNewUserResult} from './user/new.js';

const renderAdminIndex = createRoute(() => ({
	title: 'Admin Interface',
	body: (
		<CenteredMain>
			<h1>Admin</h1>
			<h2>User Admin</h2>

			<ul>
				<li>
					<a href="/admin/users">List users</a>
				</li>
				<li>
					<a href="/admin/user/new">Create user</a>
				</li>
			</ul>

			<h2>Backup</h2>
			<ul>
				<li>
					<a href="/admin/backup">Backup Management</a>
				</li>
			</ul>
		</CenteredMain>
	),
}));

export function createRenderAdmin(common: RouteCommon) {
	return {
		userList: renderAdminListUsers(common),
		userEdit: renderAdminEditUser(common),
		index: renderAdminIndex(common),
		newUser: renderAdminNewUser(common),
		newUserResult: renderAdminNewUserResult(common),
		backup: renderAdminBackup(common),
	} as const;
}
