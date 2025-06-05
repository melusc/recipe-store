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
import type {Api} from 'api';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {type ErrorRequestHandler} from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import {UnauthorisedError} from './errors.ts';
import {rateLimit} from './middleware/rate-limit.ts';
import {session} from './middleware/token.ts';
import {resolvePaginationParameters} from './pagination.ts';
import {bindRender} from './render.ts';
import {accountRouter} from './routes/account/index.ts';
import {adminRouter} from './routes/admin/index.ts';
import {apiRouter} from './routes/api.ts';
import {loginRouter} from './routes/login.ts';
import {recipeRouter} from './routes/recipe/index.ts';
import {requiredPasswordChangeRouter} from './routes/required-password-change.ts';
import {staticRouter} from './routes/static.ts';
import {userRouter} from './routes/user.ts';

export function setupServer(api: Api) {
	const app = express();

	app.set('trust proxy', 'loopback');
	app.set('x-powered-by', false);

	app.use(cookieParser());
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					'style-src': ["'self'", 'https://fonts.googleapis.com'],
					'style-src-attr': ["'unsafe-inline'"],
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
			enumerable: true,
		});
		Object.defineProperty(response.locals, 'api', {
			value: api,
			enumerable: true,
		});

		response.setHeader('permissions-policy', 'interest-cohort=()');

		next();
	});

	app.use(bindRender());

	app.use(rateLimit());

	app.use(session.middleware(api));

	app.use('/static', staticRouter);

	app.use('/', loginRouter);

	app.get('/', async (request, response) => {
		const {page, limit} = resolvePaginationParameters(request);

		response.send$.index(await api.Recipe.paginate({limit, page}));
	});

	app.get('/search', async (request, response) => {
		const query = request.search.get('q');

		if (!query) {
			response.send$.search(undefined, undefined);
			return;
		}

		const {page, limit} = resolvePaginationParameters(request);

		response.send$.search(
			query,
			await api.Recipe.search({
				limit,
				page,
				query,
			}),
		);
	});

	app.use('/account', accountRouter);
	app.use('/user', userRouter);
	app.use('/required-password-change', requiredPasswordChangeRouter);
	app.use('/recipe', recipeRouter);
	app.use('/api', apiRouter);
	app.use('/admin', adminRouter);

	app.use(((error, request, response, _next) => {
		if (error instanceof UnauthorisedError) {
			response.status(401);

			if (request.accepts('html')) {
				response.send$.error[401]();
			} else {
				response.send({
					error: 'Unauthorised',
				});
			}
		} else {
			console.error(error);
			response.status(500);

			if (request.accepts('html')) {
				response.send$.error[500]();
			} else {
				response.send({
					error: 'Internal error',
				});
			}
		}
	}) satisfies ErrorRequestHandler);

	app.use((_request, response, _next) => {
		response.status(404).send$.error[404]();
	});

	return app;
}
