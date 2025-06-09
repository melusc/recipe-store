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

import {mkdir, rm} from 'node:fs/promises';
// eslint-disable-next-line n/no-unsupported-features/node-builtins
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath} from 'node:url';

const dataDirectory = new URL('../../data/', import.meta.url);
export const imageDirectory = new URL('img/', dataDirectory);
export const temporaryImageDirectory = new URL('temp/', imageDirectory);

// eslint-disable-next-line security/detect-non-literal-fs-filename
await mkdir(imageDirectory, {recursive: true});

await rm(temporaryImageDirectory, {recursive: true, force: true});
// eslint-disable-next-line security/detect-non-literal-fs-filename
await mkdir(temporaryImageDirectory);

const databasePath = new URL('database.db', dataDirectory);
export const database = new DatabaseSync(fileURLToPath(databasePath));
