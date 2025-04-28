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

import {readdir, rm} from 'node:fs/promises';

import type {Api} from 'api';

export async function cleanImages(api: Api, imageDirectory: URL) {
	const imagesToKeep = new Set();

	for (const recipe of await api.Recipe.all()) {
		if (recipe.image) {
			imagesToKeep.add(recipe.image.name);
		}
	}

	// eslint-disable-next-line security/detect-non-literal-fs-filename
	for (const file of await readdir(imageDirectory, {withFileTypes: true})) {
		if (!file.isFile()) {
			continue;
		}

		if (!imagesToKeep.has(file.name)) {
			await rm(new URL(file.name, imageDirectory));
		}
	}
}
