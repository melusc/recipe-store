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

import {UserRoles} from 'api';
import {Router} from 'express';
import {render} from 'frontend';

import {resolvePaginationParameters} from '../pagination.ts';

export const userRouter = Router();

userRouter.get('/', (_request, response, next) => {
	const user = response.locals.user;
	if (!user) {
		next();
		return;
	}

	response.redirect(302, `/user/${user.userId}`);
});

userRouter.get('/:id', async (request, response, next) => {
	const requestUser = response.locals.user;
	const profileUserId = Number.parseInt(request.params.id, 10);
	const profileUser = response.locals.api.User.fromUserid(profileUserId);

	if (!profileUser) {
		next();
		return;
	}

	// Button to edit at /account
	const isOwner = requestUser?.userId === profileUser.userId;
	// Button to edit at /admin/user/:id
	const isAdmin = !!requestUser && requestUser.role >= UserRoles.Admin;
	const {page, limit} = resolvePaginationParameters(request);

	const recipes = await profileUser.paginateRecipes({limit, page});

	response.send(
		render.user(
			{
				user: requestUser,
				url: request.originalUrl,
			},
			profileUser,
			recipes,
			!isOwner && isAdmin,
		),
	);
});
