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

import {Router} from 'express';
import {render} from 'frontend';

import {resolvePaginationParameters} from '../../../pagination.ts';

export const adminUserListRouter = Router();

adminUserListRouter.get('/', (request, response) => {
	const {page, limit} = resolvePaginationParameters(request);

	const users = response.locals.api.User.paginate({limit, page});

	response.send(
		render.admin.userList(
			{
				user: response.locals.user,
				url: request.originalUrl,
			},
			users,
		),
	);
});
