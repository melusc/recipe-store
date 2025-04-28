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

import {ApiError, UserRoles, type Image} from 'api';
import {Router} from 'express';

import {readForm} from '../../form-validation/recipe.ts';
import {csrf, session} from '../../middleware/token.ts';
import {formdataMiddleware} from '../../upload.ts';

export const newRecipeRouter = Router();

newRecipeRouter.post(
	'/',
	session.guard(UserRoles.User),
	formdataMiddleware.single('file-image'),
	async (request, response) => {
		const body = (request.body ?? {}) as Record<string, unknown>;

		if (!csrf.validate(request, response)) {
			// Don't save image for csrf violation
			response
				.status(403)
				.send$.newRecipe(body, [
					'Could not validate CSRF Token. Please try again.',
				]);
			return;
		}

		const errors: string[] = [];
		let image: Image | undefined;
		try {
			image = await readForm.image(body, request.file, response.locals.api);
		} catch (error: unknown) {
			if (error instanceof ApiError) {
				errors.push(error.message);
			} else {
				throw error;
			}
		}
		const sections = readForm.sections(body);
		const tags = readForm.tags(body);
		let title: string = '';
		try {
			title = readForm.title(body);
		} catch (error: unknown) {
			errors.push((error as Error).message);
		}
		const duration = readForm.duration(body);
		const source = readForm.source(body);

		if (errors.length > 0) {
			response.status(400).send$.newRecipe(
				{
					...body,
					tags,
					sections,
					image: image?.name,
				},
				errors,
			);
			return;
		}

		const recipe = await response.locals.api.Recipe.create(
			title,
			response.locals.user,
			image,
			source,
			duration,
			tags,
			sections,
		);

		response.redirect(303, `/recipe/${recipe.recipeId}`);
	},
);

newRecipeRouter.get(
	'/',
	session.guard(UserRoles.User),
	(_request, response) => {
		response.send$.newRecipe({});
	},
);
