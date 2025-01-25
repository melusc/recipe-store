import type {Api} from 'api';
import express from 'express';
import {renderIndex} from 'frontend';

export function setupServer(api: Api) {
	const app = express();

	app.get('/', (_request, response) => {
		response.type('html').status(200);

		response.write('<!doctype html>');
		response.write(renderIndex(api.User.all(), api.Recipe.all()).render());

		response.end();
	});

	return app;
}
