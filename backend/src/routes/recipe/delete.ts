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

import {UnauthorisedError} from '../../errors.ts';
import {csrf, session} from '../../middleware/token.ts';
import {formdataMiddleware} from '../../upload.ts';

export const deleteRecipeRouter = Router();

deleteRecipeRouter.get(
	'/:id/delete',
	session.guard(UserRoles.User),
	async (request, response, next) => {
		const recipeId = Number.parseInt(request.params['id']!, 10);
		const recipe = await response.locals.api.Recipe.fromRecipeId(recipeId);

		if (!recipe) {
			next();
			return;
		}

		const requestUser = response.locals.user;
		const permissionToDelete =
			!!requestUser && recipe.permissionToModifyRecipe(requestUser);

		if (!permissionToDelete) {
			next(new UnauthorisedError());
			return;
		}

		response.send$.deleteRecipe(recipe);
	},
);

deleteRecipeRouter.post(
	'/:id/delete',
	session.guard(UserRoles.User),
	formdataMiddleware.none(),
	async (request, response, next) => {
		const recipeId = Number.parseInt(request.params['id']!, 10);
		const recipe = await response.locals.api.Recipe.fromRecipeId(recipeId);

		if (!recipe) {
			next();
			return;
		}

		const requestUser = response.locals.user;
		const permissionToDelete =
			!!requestUser && recipe.permissionToModifyRecipe(requestUser);

		if (!permissionToDelete) {
			next(new UnauthorisedError());
			return;
		}

		if (!csrf.validate(request, response)) {
			response.send$.deleteRecipe(
				recipe,
				'Could not validate CSRF Token. Please try again.',
			);
			return;
		}

		await recipe.delete();

		response.redirect(303, '/');
	},
);
