import {randomBytes} from 'node:crypto';
import {mkdir, rm, writeFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';

import type {Use} from '@vitest/runner';
import {test} from 'vitest';

import {createApi, type Api} from '../src/index.js';

const parentTemporaryDirectory = new URL('.tmp/', import.meta.url);
await writeFile(new URL('.gitignore', parentTemporaryDirectory), '*');

export const apiTest = test.extend({
	// eslint-disable-next-line no-empty-pattern
	async api({}, use: Use<Api>) {
		const temporaryDirectory = new URL(
			randomBytes(20).toString('base64url'),
			parentTemporaryDirectory,
		);
		await mkdir(temporaryDirectory, {recursive: true});

		const database = new DatabaseSync(':memory:');
		const api = createApi({
			imageDirectory: temporaryDirectory,
			database,
		});

		await use(api);

		database.close();
		await rm(temporaryDirectory, {recursive: true});
	},
});
