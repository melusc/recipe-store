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
import {render, type RecipePrefill} from 'frontend';

import {imageUploadDirectory} from '../../data.ts';
import {UnauthorisedError} from '../../errors.ts';
import {readForm, type FormImage} from '../../form-validation/recipe.ts';
import {csrf, session} from '../../middleware/token.ts';
import {formdataMiddleware} from '../../upload.ts';

export const editRecipeRouter = Router();

editRecipeRouter.post(
	'/:id/edit',
	session.guard(UserRoles.User),
	formdataMiddleware.single('file-image'),
	async (request, response, next) => {
		const body = (request.body ?? {}) as Record<string, unknown>;

		if (!csrf.validate(request, response)) {
			// Don't save image for csrf violation
			response.status(403).send(
				render.newRecipe(
					{
						user: response.locals.user,
						url: '/recipe/new',
					},
					csrf.generate(response.locals.user),
					body,
					['Could not validate CSRF Token. Please try again.'],
				),
			);
			return;
		}

		const id = Number.parseInt(request.params['id']!, 10);
		const recipe = response.locals.api.Recipe.fromRecipeId(id);
		const requestUser = response.locals.user;

		if (!recipe?.permissionToModifyRecipe(requestUser!)) {
			next(new UnauthorisedError());
			return;
		}

		const errors: string[] = [];
		let image: FormImage | undefined;
		const imageUnchanged = readForm.checkImageUnchanged(body, recipe);
		if (!imageUnchanged) {
			try {
				image = await readForm.image(body, request.file);
			} catch (error: unknown) {
				if (error instanceof ApiError) {
					errors.push(error.message);
				} else {
					throw error;
				}
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
				render.editRecipe(
					{
						user: response.locals.user,
						url: '/recipe/new',
					},
					csrf.generate(response.locals.user),
					recipe,
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

		// All the methods check if it has actually changed
		// so no need to check here

		recipe.updateDuration(duration);
		recipe.updateTitle(title);

		if (!imageUnchanged) {
			await recipe.updateImage(image?.buffer);
		}
		recipe.updateSections(sections);
		recipe.updateSource(source);

		for (const tag of tags) {
			recipe.addTag(tag);
		}

		response.redirect(303, `/recipe/${recipe.recipeId}`);
	},
);

editRecipeRouter.get(
	'/:id/edit',
	session.guard(UserRoles.User),
	(request, response, next) => {
		const id = Number.parseInt(request.params['id']!, 10);
		const recipe = response.locals.api.Recipe.fromRecipeId(id);
		const requestUser = response.locals.user;

		if (!recipe?.permissionToModifyRecipe(requestUser!)) {
			next(new UnauthorisedError());
			return;
		}

		const prefill: RecipePrefill = {
			duration: recipe.duration,
			sections: recipe.sections.map(section => section.source),
			image: recipe.image,
			source: recipe.source,
			tags: recipe.tags,
			title: recipe.title,
		};

		response.send(
			render.editRecipe(
				{
					user: response.locals.user,
					url: '/recipe/new',
				},
				csrf.generate(response.locals.user),
				recipe,
				prefill,
			),
		);
	},
);
