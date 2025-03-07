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

		response.write(
			renderIndex(false, api.User.all(), api.Recipe.all()).render(),
		);

		response.end();
	});

	return app;
}
