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

import {DatabaseSync} from 'node:sqlite';

import {makeSlug} from '@lusc/util/slug';

import {createRecipeClass, type Recipe} from './recipe.js';
import {createUserClass, type User} from './user.js';

export {ApiError} from './error.js';
export {type User, UserRoles} from './user.js';
export {type Recipe} from './recipe.js';

export type ApiOptions = {
	readonly database: DatabaseSync;
	readonly imageDirectory: URL;
};

export type InternalApiOptions = {
	readonly Recipe: Recipe;
	readonly User: User;
} & ApiOptions;

export type Api = {
	readonly Recipe: Recipe;
	readonly User: User;
};

function initDatabase(database: DatabaseSync) {
	database.exec('PRAGMA journal_mode=WAL;');

	// @ts-expect-error @types/node hasn't added #function yet
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	database.function(
		'sluggify',
		{
			deterministic: true,
		},
		(s: string) => makeSlug(s, {appendRandomHex: false}),
	);

	database.exec(`
		CREATE TABLE IF NOT EXISTS users (
			user_id     INTEGER PRIMARY KEY AUTOINCREMENT,
			username    TEXT NOT NULL UNIQUE,
			password    TEXT NOT NULL,
			role        INTEGER NOT NULL,
			created_at  INTEGER NOT NULL,
			updated_at  INTEGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS recipes (
			recipe_id   INTEGER PRIMARY KEY AUTOINCREMENT,
			title       TEXT NOT NULL,
			-- on delete show "deleted user"
			author      INTEGER NOT NULL,
			created_at  INTEGER NOT NULL,
			updated_at  INTEGER NOT NULL,
			sections    TEXT NOT NULL, -- JSON
			image       TEXT -- optional
		);

		CREATE TABLE IF NOT EXISTS recipe_tags (
			recipe_id  INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
			tag_name   TEXT NOT NULL,
			tag_slug   TEXT GENERATED ALWAYS AS (sluggify(tag_name)) STORED,

			PRIMARY KEY(tag_name, recipe_id)
		);
	`);
}

export function createApi(options: ApiOptions): Api {
	initDatabase(options.database);

	const {database} = options;
	let {imageDirectory} = options;
	if (!imageDirectory.href.endsWith('/')) {
		imageDirectory = new URL(imageDirectory);
		imageDirectory.href += '/';
	}

	const internalApiOptions: InternalApiOptions = {
		database,
		imageDirectory,
		// Cyclical dependency
		// passing object by reference so it will be fine :)
		Recipe: undefined!,
		User: undefined!,
	};

	const Recipe = createRecipeClass(internalApiOptions);
	const User = createUserClass(internalApiOptions);

	// @ts-expect-error They depend on each other cyclically
	internalApiOptions.Recipe = Recipe;
	// @ts-expect-error I'd still like them readonly though
	internalApiOptions.User = User;

	return {
		Recipe,
		User,
	} as const;
}
