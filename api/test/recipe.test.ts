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

import {Buffer} from 'node:buffer';
import {readFile} from 'node:fs/promises';

import {expect, test} from 'vitest';

import {ApiError, UserRoles} from '../src/index.js';

import {
	apiTest,
	hashFile,
	sampleImageHashes,
	sampleImagePaths,
} from './util.js';

apiTest('Creating recipe', async ({api: {User, Recipe}}) => {
	const timeBeforeCreation = Date.now();
	const user = User.create('vaoeo', 'lqizk', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		['vegetarian'],
		['Add @eggs'],
	);

	expect(recipe.author?.userId).toStrictEqual(user.userId);
	expect(recipe.createdAt.getTime()).toBeGreaterThanOrEqual(timeBeforeCreation);
	expect(recipe.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
	expect(recipe.image).toStrictEqual(undefined);
	expect(recipe.sections).toHaveLength(1);
	expect(recipe.tags).toStrictEqual(['vegetarian']);
	expect(recipe.title).toStrictEqual('recipe 1');

	expect(Recipe.fromRecipeId(recipe.recipeId)).toStrictEqual(recipe);
});

apiTest('Adding tags', async ({api: {User, Recipe}}) => {
	const user = User.create('ioxow', 'xsxrg', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		['vegetarian'],
		['Add @banana'],
	);

	expect(recipe.tags).toStrictEqual(['vegetarian']);
	expect(Recipe.fromRecipeId(recipe.recipeId)!.tags).toStrictEqual(recipe.tags);

	const oldUpdatedAt = recipe.updatedAt;

	// Do nothing sluggify('VEGETARIAN') === sluggify('vegetarian')
	recipe.addTag('VEGETARIAN');

	expect(recipe.tags).toStrictEqual(['vegetarian']);
	expect(Recipe.fromRecipeId(recipe.recipeId)!.tags).toStrictEqual(recipe.tags);
	expect(recipe.updatedAt.getTime()).toStrictEqual(oldUpdatedAt.getTime());

	recipe.addTag('sweet');

	expect(recipe.tags).toStrictEqual(['sweet', 'vegetarian']);
	expect(Recipe.fromRecipeId(recipe.recipeId)!.tags).toStrictEqual(recipe.tags);
	expect(recipe.updatedAt.getTime()).toBeGreaterThanOrEqual(
		oldUpdatedAt.getTime(),
	);
});

apiTest('Removing tags', async ({api: {User, Recipe}}) => {
	const user = User.create('zwpfg', 'vpjzj', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		['tag1', 'tag2', 'tag3'],
		['add @salt'],
	);

	expect(recipe.tags).toStrictEqual(['tag1', 'tag2', 'tag3']);

	recipe.removeTag('tag4');

	expect(recipe.tags).toStrictEqual(['tag1', 'tag2', 'tag3']);

	recipe.removeTag('tag2');

	expect(recipe.tags).toStrictEqual(['tag1', 'tag3']);
	expect(Recipe.fromRecipeId(recipe.recipeId)!.tags).toStrictEqual(recipe.tags);

	recipe.clearTags();
	expect(recipe.tags).toStrictEqual([]);
	expect(Recipe.fromRecipeId(recipe.recipeId)!.tags).toStrictEqual([]);
});

apiTest('Adding image', async ({api: {User, Recipe, listImages}}) => {
	const user = User.create('xnntr', 'mrmbp', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		[],
		['add @cinnamon'],
	);

	expect(recipe.image).toBeUndefined();
	await expect(listImages()).resolves.toStrictEqual([]);

	expect(Recipe.fromRecipeId(recipe.recipeId)!.image).toStrictEqual(
		recipe.image,
	);

	const newImage = await readFile(sampleImagePaths.jpg);
	await recipe.updateImage(newImage);

	await expect(listImages()).resolves.toStrictEqual([recipe.image]);
	await expect(hashFile(recipe.image!)).resolves.toStrictEqual(
		sampleImageHashes.jpg,
	);

	expect(Recipe.fromRecipeId(recipe.recipeId)!.image).toStrictEqual(
		recipe.image,
	);
});

apiTest('Replacing image', async ({api: {User, Recipe, listImages}}) => {
	const user = User.create('ajops', 'xrcnm', UserRoles.User);
	const firstImage = await readFile(sampleImagePaths.webp);

	const recipe = await Recipe.create(
		'recipe',
		user,
		firstImage,
		[],
		['add @rice'],
	);

	expect(Recipe.fromRecipeId(recipe.recipeId)!.image).toStrictEqual(
		recipe.image,
	);

	await expect(hashFile(recipe.image!)).resolves.toStrictEqual(
		sampleImageHashes.webp,
	);
	await expect(listImages()).resolves.toStrictEqual([recipe.image]);

	const secondImage = await readFile(sampleImagePaths.png);
	await recipe.updateImage(secondImage);

	expect(Recipe.fromRecipeId(recipe.recipeId)!.image).toStrictEqual(
		recipe.image,
	);

	await expect(hashFile(recipe.image!)).resolves.toStrictEqual(
		sampleImageHashes.png,
	);
	await expect(listImages()).resolves.toStrictEqual([recipe.image]);
});

apiTest('Deleting image', async ({api: {User, Recipe, listImages}}) => {
	const user = User.create('gfyju', 'lkkpy', UserRoles.User);
	const image = await readFile(sampleImagePaths.png);

	const recipe = await Recipe.create('recipe', user, image, [], ['add @pasta']);

	await expect(hashFile(recipe.image!)).resolves.toStrictEqual(
		sampleImageHashes.png,
	);
	await expect(listImages()).resolves.toStrictEqual([recipe.image]);

	expect(Recipe.fromRecipeId(recipe.recipeId)!.image).toStrictEqual(
		recipe.image,
	);

	await recipe.updateImage(undefined);

	expect(recipe.image).toBeUndefined();
	expect(Recipe.fromRecipeId(recipe.recipeId)!.image).toStrictEqual(
		recipe.image,
	);

	await expect(listImages()).resolves.toStrictEqual([]);
});

apiTest(
	'Accepts image/jpeg, image/png, image/webp',
	async ({api: {Recipe, User}}) => {
		const user = User.create('pvcif', 'kjpzh', UserRoles.User);
		const recipe = await Recipe.create(
			'recipe',
			user,
			undefined,
			[],
			['add @popcorn'],
		);

		for (const path of [
			sampleImagePaths.jpg,
			sampleImagePaths.png,
			sampleImagePaths.webp,
		]) {
			const image = await readFile(path);
			await recipe.updateImage(image);
		}
	},
);

apiTest(
	'Rejects non-images or unsupported image types',
	async ({api: {Recipe, User, listImages}}) => {
		const user = User.create('gxdwb', 'aznpe', UserRoles.User);
		const recipe = await Recipe.create(
			'recipe',
			user,
			undefined,
			[],
			['add @apples'],
		);

		const gifImage = await readFile(sampleImagePaths.gif);
		await expect(
			(async () => {
				await recipe.updateImage(gifImage);
			})(),
		).rejects.to.throw(ApiError, /unknown/i);

		await expect(listImages()).resolves.toHaveLength(0);

		await expect(
			(async () => {
				await recipe.updateImage(Buffer.from('<!doctype html><html></html>'));
			})(),
		).rejects.to.throw(ApiError, /unknown/i);

		await expect(listImages()).resolves.toHaveLength(0);
	},
);

apiTest('Rejects too large images', async ({api: {Recipe, User}}) => {
	const user = User.create('aqosq', 'leoiu', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe',
		user,
		undefined,
		[],
		['add @tofu'],
	);

	let buffer = await readFile(sampleImagePaths.png);

	// Duplicating should still leave it a valid png
	// asking `file-type` because the headers aren't changed
	while (buffer.byteLength < 11e6) {
		buffer = Buffer.concat([buffer, buffer]);
	}

	await expect(
		(async () => {
			await recipe.updateImage(buffer);
		})(),
	).rejects.to.throw(ApiError, /large/i);
});

apiTest('Paginate', async ({api: {User, Recipe}}) => {
	const user = User.create('ctiah', 'sevbq', UserRoles.User);

	await Promise.all(
		Array.from({length: 25}, (_v, index) =>
			Recipe.create(`recipe ${index}`, user, undefined, [], []),
		),
	);

	expect(Recipe.all()).toHaveLength(25);

	const firstTen = Recipe.paginate(10, undefined);
	expect(firstTen).toHaveLength(10);
	const nextTen = Recipe.paginate(10, firstTen.at(-1)!.recipeId);
	expect(nextTen).toHaveLength(10);
	const lastFive = Recipe.paginate(10, nextTen.at(-1)!.recipeId);
	expect(lastFive).toHaveLength(5);

	const paginatedIds = new Set(
		[...firstTen, ...nextTen, ...lastFive].map(recipe => recipe.recipeId),
	);
	const expectedIds = new Set(Recipe.all().map(recipe => recipe.recipeId));
	expect(paginatedIds).toStrictEqual(expectedIds);
});

test.todo('Updated sections');
test.todo('Update title');
test.todo('Recipe permissions');
