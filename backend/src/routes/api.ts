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

import {randomBytes} from 'node:crypto';
import {rm, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

import {ApiError, randomImageName, UserRoles} from 'api';
import express, {Router} from 'express';

import {imageUploadDirectory} from '../data.ts';
import {readForm, type FormImage} from '../form.ts';
import {csrf, session} from '../middleware/token.ts';
import {formdataMiddleware} from '../upload.ts';

export const apiRouter = Router();

apiRouter.use(session.guard(UserRoles.User));

const deletionKeys = new Map<string, URL>();

apiRouter.use((_request, response, next) => {
	response.setHeader('X-CSRF-Token', csrf.generate(response.locals.user));
	next();
});

apiRouter.post(
	'/temp-image/upload',
	formdataMiddleware.single('image'),
	async (request, response) => {
		if (!csrf.validate(request, response)) {
			response.status(401).json({
				error: 'Could not validate CSRF Token. Please try again.',
			});
			return;
		}

		const file = request.file;
		let image: FormImage | undefined;
		try {
			image = await readForm.image({}, file);
		} catch (error: unknown) {
			if (error instanceof ApiError) {
				response.status(400).json({
					error: error.message,
				});
				return;
			}

			throw error;
		}

		if (image) {
			const name = randomImageName(image.extension);
			const savePath = new URL(name, imageUploadDirectory);
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			await writeFile(savePath, image.buffer);
			const deletionKey = randomBytes(256).toString('base64url');
			deletionKeys.set(deletionKey, savePath);

			response.json({
				name,
				url: `/api/temp-image/${name}`,
				deletionKey,
			});
		} else {
			response.status(400).json({
				error: 'Not a valid image.',
			});
		}
	},
);

apiRouter.use(
	'/temp-image/',
	express.static(fileURLToPath(imageUploadDirectory), {
		index: false,
		dotfiles: 'ignore',
	}),
);

apiRouter.post(
	'/temp-image/delete',
	formdataMiddleware.none(),
	async (request, response) => {
		if (!csrf.validate(request, response)) {
			response.status(401).json({
				error: 'Could not validate CSRF Token. Please try again.',
			});
			return;
		}

		const body = (request.body ?? {}) as Record<string, unknown>;
		const key = body['deletion-key'];

		if (typeof key === 'string') {
			const imagePath = deletionKeys.get(key);
			deletionKeys.delete(key);
			if (imagePath) {
				await rm(imagePath);

				response.json('OK');
				return;
			}
		}

		response.status(401).json({
			error: 'Invalid key.',
		});
	},
);
