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

import {writeFile} from 'node:fs/promises';

import {ApiError, randomImageName, UserRoles} from 'api';
import {Router} from 'express';
import {render} from 'frontend';

import {imageUploadDirectory} from '../../data.ts';
import {readForm, type FormImage} from '../../form-validation/recipe.ts';
import {csrf, session} from '../../middleware/token.ts';
import {formdataMiddleware} from '../../upload.ts';

export const newRecipeRouter = Router();

newRecipeRouter.use(session.guard(UserRoles.User));

newRecipeRouter.post(
	'/',
	formdataMiddleware.single('file-image'),
	async (request, response) => {
		const body = (request.body ?? {}) as Record<string, unknown>;

		if (!csrf.validate(request, response)) {
			// Don't save image for csrf violation
			response
				.status(403)
				.send(
					render.newRecipe(
						response.locals.user,
						'/recipe/new',
						csrf.generate(response.locals.user),
						body,
						['Could not validate CSRF Token. Please try again.'],
					),
				);
			return;
		}

		const errors: string[] = [];
		let image: FormImage | undefined;
		try {
			image = await readForm.image(body, request.file);
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
			let savedLocationName = image?.savedName;

			if (image && !savedLocationName) {
				savedLocationName = randomImageName(image.extension);
				// eslint-disable-next-line security/detect-non-literal-fs-filename
				await writeFile(
					new URL(savedLocationName, imageUploadDirectory),
					image.buffer,
				);
			}

			response.status(400).send(
				render.newRecipe(
					response.locals.user,
					'/recipe/new',
					csrf.generate(response.locals.user),
					{
						...body,
						tags,
						sections,
						image: savedLocationName,
					},
					errors,
				),
			);
			return;
		}

		const recipe = await response.locals.api.Recipe.create(
			title,
			response.locals.user!,
			image?.buffer,
			source,
			duration,
			tags,
			sections,
		);

		response.redirect(303, `/recipe/${recipe.recipeId}`);
	},
);

newRecipeRouter.get('/', (_request, response) => {
	response.send(
		render.newRecipe(
			response.locals.user,
			'/recipe/new',
			csrf.generate(response.locals.user),
			{},
		),
	);
});
