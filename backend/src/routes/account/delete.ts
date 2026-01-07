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

import {UserDeletion, UserRoles} from 'api';
import {Router} from 'express';

import {csrf, session} from '../../middleware/token.ts';
import {formdataMiddleware} from '../../upload.ts';

export const accountDeleteRouter = Router();

accountDeleteRouter.get(
	'/',
	session.guard(UserRoles.User),
	(_request, response) => {
		response.send$.accountDelete(response.locals.user!, false);
	},
);

accountDeleteRouter.post(
	'/',
	session.guard(UserRoles.User),
	formdataMiddleware.none(),
	async (request, response) => {
		if (!csrf.validate(request, response)) {
			response
				.status(400)
				.send$.accountDelete(
					response.locals.user!,
					false,
					'Could not validate CSRF Token. Please try again.',
				);
			return;
		}

		const body = (request.body ?? {}) as Record<string, unknown>;
		const password = body['password'];
		const shouldDeleteRecipes = body['delete-recipes'] === 'on';

		if (typeof password !== 'string' || !password) {
			response
				.status(400)
				.send$.accountDelete(response.locals.user!, false, 'Missing password.');
			return;
		}

		try {
			response.locals.user!.confirmPassword(password);
		} catch {
			response
				.status(400)
				.send$.accountDelete(
					response.locals.user!,
					false,
					'Incorrect password. Please try again.',
				);
			return;
		}

		try {
			await response.locals.user?.deleteUser(
				shouldDeleteRecipes
					? UserDeletion.DeleteRecipes
					: UserDeletion.KeepRecipes,
			);
		} catch {
			response
				.status(400)
				.send$.accountDelete(
					response.locals.user!,
					false,
					'Could not complete your request. Please try again or contact an admin.',
				);
			return;
		}

		session.clearCookie(request, response);
		response.redirect(303, '/');
	},
);
