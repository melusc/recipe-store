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
import type {Api, User} from 'api';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import {renderIndex, render404, renderLogin} from 'frontend';
import helmet from 'helmet';
import morgan from 'morgan';

import {setHeaders} from './middleware/set-headers.ts';
import {session} from './middleware/token.ts';
import {staticRouter} from './routes/static.ts';
import {formdataMiddleware} from './upload.ts';

export function setupServer(api: Api) {
	const app = express();

	app.set('trust proxy', 'loopback');
	app.set('x-powered-by', false);

	app.use(cookieParser());
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					'script-src': [
						"'self'",
						'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/',
						"'unsafe-inline'",
					],
					'img-src': [
						"'self'",
						'data:',
						'picsum.photos',
						'fastly.picsum.photos',
					],
				},
			},

			// Nginx already sets the following
			xContentTypeOptions: false,
			strictTransportSecurity: false,
			xFrameOptions: false,
			xXssProtection: false,
		}),
	);
	app.use(cors());
	app.use(morgan('dev'));
	app.use((request, response, next) => {
		Object.defineProperty(request, 'search', {
			value: new RelativeUrl(request.url).searchParams,
		});
		Object.defineProperty(response.locals, 'api', {
			value: api,
		});

		next();
	});
	app.use(
		setHeaders({
			'permissions-policy': 'interest-cohort=()',
		}),
	);

	app.use(session.middleware(api));

	app.use('/static', staticRouter);

	app.get('/login', (request, response) => {
		if (response.locals.user) {
			const redirect = new RelativeUrl(request.search.get('continue') ?? '/');
			response.redirect(302, redirect.href);
		} else {
			response.status(200).send(renderLogin(undefined, '/login', undefined));
		}
	});

	app.post('/login', formdataMiddleware.none(), (request, response) => {
		if (typeof request.body !== 'object' || request.body === null) {
			response
				.status(400)
				.send(
					renderLogin(
						undefined,
						'/login',
						'Something went wrong! Please try again.',
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
				.send(renderLogin(undefined, '/login', 'Please fill all inputs.'));
			return;
		}

		let user: User;
		try {
			user = api.User.login(username, password);
		} catch {
			response
				.status(400)
				.send(
					renderLogin(
						undefined,
						'/login',
						'Incorrect credentials. Please try again.',
					),
				);
			return;
		}

		session.setCookie(user.userId, response);

		const redirect = new RelativeUrl(request.search.get('continue') ?? '/');
		response.redirect(302, redirect.href);
	});

	app.get('/', (_request, response) => {
		response
			.status(200)
			.send(renderIndex(response.locals.user, '/', api.Recipe.all()));
	});

	app.use((_request, response) => {
		response.status(404);
		response.send(render404(response.locals.user, '/404'));
	});

	return app;
}
