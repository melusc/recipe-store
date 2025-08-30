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

import type {Buffer} from 'node:buffer';

import {
	ImageSaveType,
	type Api,
	type Image,
	type JsonRecipe,
	type JsonUser,
} from 'api';
import JSZip from 'jszip';

export async function createBackup(api: Api) {
	const zip = new JSZip();

	const users: JsonUser[] = [];

	for (const user of api.User.all()) {
		users.push(user.toJson());
	}

	zip.file('users.json', JSON.stringify(users, undefined, '\t'));

	const recipes: JsonRecipe[] = [];

	for (const recipe of await api.Recipe.all()) {
		recipes.push(recipe.toJson());
		if (recipe.image) {
			zip.file(`images/${recipe.image.name}`, recipe.image.read());
		}
	}

	zip.file('recipes.json', JSON.stringify(recipes, undefined, '\t'));

	const filenameDate = new Date().toISOString().replaceAll(':', '.');
	const filename = `recipe-store-backup-${filenameDate}.zip`;

	return {
		filename,
		stream: zip.generateNodeStream({
			compression: 'DEFLATE',
			compressionOptions: {
				level: 5,
			},
		}),
	};
}

export async function restoreBackup(api: Api, file: Buffer) {
	const zip = new JSZip();
	try {
		await zip.loadAsync(file);
	} catch {
		throw new Error('Could not load file as a zip file.');
	}

	const usersJson = await zip.file('users.json')?.async('string');
	if (!usersJson) {
		throw new Error('Zip file is missing users.json');
	}
	const parsedUsersJson = JSON.parse(usersJson) as readonly JsonUser[];
	const skippedUsers: string[] = [];

	const recipesJson = await zip.file('recipes.json')?.async('string');
	if (!recipesJson) {
		throw new Error('Zip file is missing recipes.json');
	}

	const parsedRecipesJson = JSON.parse(recipesJson) as readonly JsonRecipe[];
	const images = zip.folder('images');
	if (!images) {
		throw new Error('Zip file is missing images/ directory.');
	}

	for (const user of parsedUsersJson) {
		try {
			api.User.fromJson(user);
		} catch {
			skippedUsers.push(user.username);
		}
	}

	for (const recipe of parsedRecipesJson) {
		const imageBuffer =
			recipe.image === null
				? undefined
				: await images.file(recipe.image)?.async('nodebuffer');
		let image: Image | undefined;
		try {
			image =
				imageBuffer &&
				(await api.Image.create(imageBuffer, ImageSaveType.TemporaryImage));
		} catch {
			throw new Error(`Image images/${recipe.image} is not a valid image.`);
		}
		await api.Recipe.fromJson(recipe, image);
	}

	return skippedUsers;
}
