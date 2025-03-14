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

import type {Api} from 'api';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import {renderIndex} from 'frontend';
import helmet from 'helmet';
import morgan from 'morgan';

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

	app.use('/static', staticRouter);

	app.get('/', (_request, response) => {
		response.type('html').status(200);

		response.write(renderIndex(false, api.Recipe.all()).render());

		response.end();
	});

	return app;
}
