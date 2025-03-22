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
import type {Api} from 'api';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import {render} from 'frontend';
import helmet from 'helmet';
import morgan from 'morgan';

import {setHeaders} from './middleware/set-headers.ts';
import {session} from './middleware/token.ts';
import {loginRouter} from './routes/login.ts';
import {staticRouter} from './routes/static.ts';

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

	app.use('/login', loginRouter);

	app.get('/', (_request, response) => {
		response
			.status(200)
			.send(render.index(response.locals.user, '/', api.Recipe.all()));
	});

	app.use((_request, response) => {
		response.status(404);
		response.send(render.error404(response.locals.user, '/404'));
	});

	return app;
}
