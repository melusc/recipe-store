import {fileURLToPath} from 'node:url';

import type {Api} from 'api';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import {renderIndex} from 'frontend';
import helmet from 'helmet';
import morgan from 'morgan';

export function setupServer(api: Api) {
	const app = express();

	app.set('trust proxy', 'loopback');
	app.set('x-powered-by', false);

	app.use(cookieParser());
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					'script-src': ["'self'", "'unsafe-inline'"],
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

	app.get('/', (_request, response) => {
		response.type('html').status(200);

		response.write(renderIndex(api.User.all(), api.Recipe.all()).render());

		response.end();
	});

	const cssDirectory = fileURLToPath(import.meta.resolve('frontend/css'));
	app.use(
		'/static/css',
		express.static(cssDirectory, {
			index: false,
			dotfiles: 'ignore',
		}),
	);

	return app;
}
