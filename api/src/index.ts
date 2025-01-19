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

import {createUserClass} from './api/user.js';

export * from './error.js';
export {type User, UserRoles} from './api/user.js';

export type ApiOptions = {
	readonly database: DatabaseSync;
	readonly imageDirectory: URL;
};

function initDatabase(database: DatabaseSync) {
	database.exec('PRAGMA journal_mode=WAL;');

	/*
		Public ids have incrementing ids which looks nice
		Internal ids use a random string
	*/

	database.exec(`
		CREATE TABLE IF NOT EXISTS users (
			-- public id -> /users/$ID
			user_id     INTEGER PRIMARY KEY AUTOINCREMENT,
			username    TEXT NOT NULL UNIQUE,
			password    TEXT NOT NULL,
			role        INTEGER NOT NULL,
			created_at  INTEGER NOT NULL,
			updated_at  INTEGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS tags (
			-- internal id <- /tags/$SLUG
			tag_id      TEXT PRIMARY KEY,
			name        TEXT NOT NULL UNIQUE,
			slug        TEXT NOT NULL UNIQUE,
			updated_at  INTEGER NOT NULL,
			created_at  INTEGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS recipe_tags (
			tag_id     TEXT NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
			recipe_id  INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,

			PRIMARY KEY(tag_id, recipe_id)
		);

		CREATE TABLE IF NOT EXISTS recipes (
			-- public id -> /recipes/$ID
			recipe_id   INTEGER PRIMARY KEY AUTOINCREMENT,
			title       TEXT NOT NULL,
			-- on delete show "deleted user"
			author      INTEGER DEFAULT -1 REFERENCES users(user_id) ON DELETE SET DEFAULT,
			created_at  INTEGER NOT NULL,
			updated_at  INTEGER NOT NULL,
			image       TEXT -- optional
		);
	`);
}

export function createApi(options: ApiOptions) {
	initDatabase(options.database);

	return {
		User: createUserClass(options),
	} as const;
}
