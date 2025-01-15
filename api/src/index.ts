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

import {createUserClass} from './user.js';

export * from './error.js';
export {type User, UserRoles} from './user.js';

export type ApiOptions = {
	readonly database: DatabaseSync;
	readonly imageDirectory: URL;
};

function initDatabase(database: DatabaseSync) {
	database.exec(`
		CREATE TABLE IF NOT EXISTS users (
				userid TEXT PRIMARY KEY,
				username TEXT NOT NULL UNIQUE,
				password TEXT NOT NULL,
				role INTEGER NOT NULL
		);
	`);
}

export function createApi(options: ApiOptions) {
	initDatabase(options.database);

	return {
		User: createUserClass(options),
	} as const;
}
