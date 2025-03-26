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

import {createHash, randomBytes, type BinaryLike} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readdir, mkdir, rm, writeFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';

import type {Use} from '@vitest/runner';
import {test} from 'vitest';

import {createApi, type Api} from '../src/index.js';

const parentTemporaryDirectory = new URL('.tmp/', import.meta.url);
// eslint-disable-next-line security/detect-non-literal-fs-filename
await mkdir(parentTemporaryDirectory, {recursive: true});
// eslint-disable-next-line security/detect-non-literal-fs-filename
await writeFile(new URL('.gitignore', parentTemporaryDirectory), '*');

type UtilityApi = Readonly<
	Api & {
		listImages(): Promise<readonly string[]>;
		imageDirectory: URL;
	}
>;

const fixtureDirectory = new URL('fixtures/', import.meta.url);

export const sampleImagePaths = {
	jpg: new URL('image1.jpg', fixtureDirectory),
	webp: new URL('image2.webp', fixtureDirectory),
	png: new URL('image3.png', fixtureDirectory),
	gif: new URL('image4.gif', fixtureDirectory),
} as const;

export const sampleImageHashes = Object.fromEntries(
	await Promise.all(
		Object.entries(sampleImagePaths).map(([name, path]) =>
			hashFile(path).then(hash => [name, hash]),
		),
	),
) as {
	jpg: string;
	webp: string;
	png: string;
	gif: string;
};

export async function hashFile(path: URL) {
	const hash = createHash('sha1');

	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const stream = createReadStream(path);

	for await (const chunk of stream) {
		hash.update(chunk as BinaryLike);
	}

	return hash.digest('hex');
}

export const apiTest = test.extend({
	// eslint-disable-next-line no-empty-pattern
	async api({}, use: Use<UtilityApi>) {
		const temporaryDirectory = new URL(
			`${randomBytes(20).toString('base64url')}/`,
			parentTemporaryDirectory,
		);
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		await mkdir(temporaryDirectory);

		const database = new DatabaseSync(':memory:');
		const api = createApi({
			imageDirectory: temporaryDirectory,
			database,
		});

		const utilityApi = {
			...api,
			imageDirectory: temporaryDirectory,
			async listImages() {
				// eslint-disable-next-line security/detect-non-literal-fs-filename
				return readdir(temporaryDirectory);
			},
		};

		await use(utilityApi);

		database.close();
		await rm(temporaryDirectory, {recursive: true});
	},
});
