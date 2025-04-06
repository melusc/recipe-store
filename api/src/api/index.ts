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

import {DatabaseSync, type SQLInputValue} from 'node:sqlite';

import {makeSlug} from '@lusc/util/slug';

import {Image} from './image.js';
import {Recipe} from './recipe.js';
import {User} from './user.js';

export type ApiOptions = {
	readonly database: DatabaseSync;
	readonly imageDirectory: URL;
	readonly temporaryImageDirectory: URL;
};

export type Api = {
	readonly Recipe: typeof Recipe;
	readonly User: typeof User;
	readonly Image: typeof Image;
};

export type InternalApiOptions = Api & ApiOptions;

function initDatabase(database: DatabaseSync) {
	database.exec('PRAGMA journal_mode=WAL;');

	database.function(
		'sluggify',
		{
			deterministic: true,
		},
		(s: SQLInputValue) => {
			if (typeof s !== 'string') {
				throw new TypeError(
					`Unexpected ${typeof s} passed to sluggify(). Only strings are supported.`,
				);
			}

			return makeSlug(s, {appendRandomHex: false});
		},
	);

	database.exec(`
		CREATE TABLE IF NOT EXISTS users (
			user_id            INTEGER PRIMARY KEY AUTOINCREMENT,
			username           TEXT NOT NULL UNIQUE,
			displayname        TEXT NOT NULL,
			password           TEXT NOT NULL,
			require_pw_change  BOOLEAN NOT NULL CHECK (require_pw_change IN (0, 1)),
			role               INTEGER NOT NULL,
			created_at         INTEGER NOT NULL,
			updated_at         INTEGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS recipes (
			recipe_id   INTEGER PRIMARY KEY AUTOINCREMENT,
			title       TEXT NOT NULL,
			-- on delete show "deleted user"
			author      INTEGER NOT NULL,
			created_at  INTEGER NOT NULL,
			updated_at  INTEGER NOT NULL,
			sections    TEXT NOT NULL, -- JSON
			image       TEXT, -- optional
			source      TEXT, -- optional
			duration    TEXT -- optional
		);

		CREATE TABLE IF NOT EXISTS recipe_tags (
			recipe_id  INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
			tag_name   TEXT NOT NULL,
			tag_slug   TEXT GENERATED ALWAYS AS (sluggify(tag_name)) STORED,

			PRIMARY KEY(tag_name, recipe_id)
		);
	`);
}

function normaliseDirectoryUrl(directory: URL) {
	if (!directory.href.endsWith('/')) {
		return new URL(directory.href + '/');
	}

	return directory;
}

export function createApi(options: ApiOptions): Api {
	initDatabase(options.database);

	const {database, imageDirectory, temporaryImageDirectory} = options;

	const internalApiOptions: InternalApiOptions = {
		database,
		imageDirectory: normaliseDirectoryUrl(imageDirectory),
		temporaryImageDirectory: normaliseDirectoryUrl(temporaryImageDirectory),
		// Cyclical dependency
		// They don't need to access each other during creation
		Recipe: undefined!,
		User: undefined!,
		Image: undefined!,
	};

	class RecipeInjected extends Recipe {
		override get apiOptions(): InternalApiOptions {
			return internalApiOptions;
		}

		static override get apiOptions(): InternalApiOptions {
			return internalApiOptions;
		}
	}

	class UserInjected extends User {
		override get apiOptions(): InternalApiOptions {
			return internalApiOptions;
		}

		static override get apiOptions(): InternalApiOptions {
			return internalApiOptions;
		}
	}

	class ImageInjected extends Image {
		override get apiOptions(): InternalApiOptions {
			return internalApiOptions;
		}

		static override get apiOptions(): InternalApiOptions {
			return internalApiOptions;
		}
	}

	// @ts-expect-error They depend on each other cyclically
	internalApiOptions.Recipe = RecipeInjected;
	// @ts-expect-error They are readonly, but that is only important afterwards
	internalApiOptions.User = UserInjected;
	// @ts-expect-error See above ^
	internalApiOptions.Image = ImageInjected;

	return {
		Recipe: RecipeInjected,
		User: UserInjected,
		Image: ImageInjected,
	} as const;
}
