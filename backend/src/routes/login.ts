/*!
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
import type {User} from 'api';
import {Router} from 'express';
import {render} from 'frontend';

import {csrf, CsrfFormType, session} from '../middleware/token.ts';
import {formdataMiddleware} from '../upload.ts';

export const loginRouter = Router();

loginRouter.get('/login', (request, response) => {
	if (response.locals.user) {
		const redirect = new RelativeUrl(request.search.get('continue') ?? '/');
		response.redirect(303, redirect.href);
	} else {
		response.status(200).send(
			render.login(
				undefined,
				'/login',

				csrf.generate(undefined, CsrfFormType.login),

				undefined,
			),
		);
	}
});

loginRouter.get('/logout', (_request, response) => {
	session.clearCookie(response);
	response.redirect(303, '/');
});

loginRouter.post('/login', formdataMiddleware.none(), (request, response) => {
	if (typeof request.body !== 'object' || request.body === null) {
		response
			.status(400)
			.send(
				render.login(
					undefined,
					'/login',
					csrf.generate(undefined, CsrfFormType.login),
					'Something went wrong! Please try again.',
				),
			);
		return;
	}

	if (!csrf.validate(CsrfFormType.login, request, response)) {
		response
			.status(400)
			.send(
				render.login(
					undefined,
					'/login',
					csrf.generate(undefined, CsrfFormType.login),
					'Could not validate CSRF Token. Please try again.',
				),
			);
		return;
	}

	const body = request.body as {username?: string; password?: string};
	const username = body.username;
	const password = body.password;

	if (typeof username !== 'string' || typeof password !== 'string') {
		response
			.status(400)
			.send(
				render.login(
					undefined,
					'/login',
					csrf.generate(undefined, CsrfFormType.login),
					'Please fill all inputs.',
				),
			);
		return;
	}

	let user: User;
	try {
		user = response.locals.api.User.login(username, password);
	} catch {
		response
			.status(400)
			.send(
				render.login(
					undefined,
					'/login',
					csrf.generate(undefined, CsrfFormType.login),
					'Incorrect credentials. Please try again.',
				),
			);
		return;
	}

	session.setCookie(user.userId, response);

	const redirect = new RelativeUrl(request.search.get('continue') ?? '/');
	response.redirect(303, redirect.href);
});
