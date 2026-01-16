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

import {UserDeletion} from 'api';
import {Router} from 'express';

import {csrf} from '../../../middleware/token.ts';
import {formdataMiddleware} from '../../../upload.ts';

export const adminUserDeleteRouter = Router();

adminUserDeleteRouter.get('/:id/delete', (request, response, next) => {
	const id = Number.parseInt(request.params.id, 10);
	const user = response.locals.api.User.fromUserid(id);
	if (!user) {
		next();
		return;
	}

	response.send$.accountDelete(user, true);
});

adminUserDeleteRouter.post<{id: string}>(
	'/:id/delete',
	formdataMiddleware.none(),
	async (request, response, next) => {
		const id = Number.parseInt(request.params.id, 10);
		const user = response.locals.api.User.fromUserid(id);
		if (!user) {
			next();
			return;
		}

		if (!csrf.validate(request, response)) {
			response
				.status(400)
				.send$.accountDelete(
					user,
					true,
					'Could not validate CSRF Token. Please try again.',
				);
			return;
		}

		const body = (request.body ?? {}) as Record<string, unknown>;
		const shouldDeleteRecipes = body['delete-recipes'] === 'on';

		try {
			await user.deleteUser(
				shouldDeleteRecipes
					? UserDeletion.DeleteRecipes
					: UserDeletion.KeepRecipes,
			);
		} catch {
			response
				.status(400)
				.send$.accountDelete(
					user,
					true,
					'Could not complete your request. Please try again.',
				);
			return;
		}

		response.redirect(303, '/admin/users');
	},
);
