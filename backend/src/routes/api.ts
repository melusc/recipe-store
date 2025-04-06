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

import {ApiError, UserRoles, type Image} from 'api';
import {Router} from 'express';

import {readForm} from '../form-validation/recipe.ts';
import {csrf, session} from '../middleware/token.ts';
import {formdataMiddleware} from '../upload.ts';

export const apiRouter = Router();

apiRouter.use(session.guard(UserRoles.User));

const deletionKeys = new Map<string, Image>();

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
		let image: Image | undefined;
		try {
			image = await readForm.image({}, file, response.locals.api);
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
			const deletionKey = randomBytes(256).toString('base64url');
			deletionKeys.set(deletionKey, image);

			response.json({
				name: image.name,
				url: `/static/user-content/${image.name}`,
				deletionKey,
			});
		} else {
			response.status(400).json({
				error: 'Not a valid image.',
			});
		}
	},
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
			const image = deletionKeys.get(key);
			deletionKeys.delete(key);
			if (image?.isTemporary()) {
				try {
					await image.rm();
				} catch {}
			}

			response.json('OK');
		}

		response.status(401).json({
			error: 'Invalid key.',
		});
	},
);
