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

import {RelativeUrl} from '@lusc/util/relative-url';
import {UserRoles} from 'api';
import {Router} from 'express';
import {render} from 'frontend';

import {readAccountForm} from '../form-validation/account.ts';
import {csrf, session} from '../middleware/token.ts';
import {formdataMiddleware} from '../upload.ts';

export const requiredPasswordChangeRouter = Router();

requiredPasswordChangeRouter.use(
	session.guard(UserRoles.User),
	(request, response, next) => {
		if (response.locals.user!.requirePasswordChange) {
			next();
			return;
		}

		const continueUrl = new RelativeUrl(request.search.get('continue') ?? '/');
		response.redirect(303, continueUrl.href);
	},
);

requiredPasswordChangeRouter.get('/', (_request, response) => {
	response.send(
		render.requiredPasswordChange(
			{
				user: response.locals.user,
				url: '/required-password-change',
			},
			csrf.generate(response.locals.user),
		),
	);
});

requiredPasswordChangeRouter.post(
	'/',
	formdataMiddleware.none(),
	(request, response) => {
		const user = response.locals.user!;
		const body = (request.body ?? {}) as Record<string, unknown>;

		if (!csrf.validate(request, response)) {
			response.send(400).send(
				render.requiredPasswordChange(
					{
						user: response.locals.user,
						url: '/required-password-change',
					},
					csrf.generate(response.locals.user),
					['Could not validate CSRF Token. Please try again.'],
				),
			);
			return;
		}

		try {
			const newPassword = readAccountForm.newPasswords(body);

			user.resetPassword(newPassword);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Internal error.';

			response.status(400).send(
				render.requiredPasswordChange(
					{
						user: response.locals.user,
						url: '/required-password-change',
					},
					csrf.generate(response.locals.user),
					[errorMessage],
				),
			);

			return;
		}

		const continueUrl = new RelativeUrl(request.search.get('continue') ?? '/');
		response.redirect(303, continueUrl.href);
	},
);
