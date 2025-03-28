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

import {Buffer} from 'node:buffer';
import {readFile} from 'node:fs/promises';

import {expect} from 'vitest';

import {ApiError, UserRoles} from '../src/index.js';

import {
	apiTest,
	hashFile,
	sampleImageHashes,
	sampleImagePaths,
} from './utilities.js';

apiTest('Creating recipe', async ({api: {User, Recipe}}) => {
	const timeBeforeCreation = Date.now();
	const user = User.create('vaoeo', 'fybec', 'lqizk', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
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
	const user = User.create('ioxow', 'fphkp', 'xsxrg', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
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
	const user = User.create('zwpfg', 'rcufb', 'vpjzj', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
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

apiTest(
	'Adding image',
	async ({api: {User, Recipe, listImages, imageDirectory}}) => {
		const user = User.create('xnntr', 'slnhb', 'mrmbp', UserRoles.User);
		const recipe = await Recipe.create(
			'recipe 1',
			user,
			undefined,
			undefined,
			[],
			['add @cinnamon'],
		);

		expect(recipe.image).toBeUndefined();
		await expect(listImages()).resolves.toStrictEqual([]);

		expect(Recipe.fromRecipeId(recipe.recipeId)!.image).toStrictEqual(
			recipe.image,
		);

		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const newImage = await readFile(sampleImagePaths.jpg);
		await recipe.updateImage(newImage);

		await expect(listImages()).resolves.toStrictEqual([recipe.image]);
		await expect(
			hashFile(new URL(recipe.image!, imageDirectory)),
		).resolves.toStrictEqual(sampleImageHashes.jpg);

		expect(Recipe.fromRecipeId(recipe.recipeId)!.image).toStrictEqual(
			recipe.image,
		);
	},
);

apiTest(
	'Replacing image',
	async ({api: {User, Recipe, listImages, imageDirectory}}) => {
		const user = User.create('ajops', 'dbukz', 'xrcnm', UserRoles.User);
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const firstImage = await readFile(sampleImagePaths.webp);

		const recipe = await Recipe.create(
			'recipe',
			user,
			firstImage,
			undefined,
			[],
			['add @rice'],
		);

		expect(Recipe.fromRecipeId(recipe.recipeId)!.image).toStrictEqual(
			recipe.image,
		);

		await expect(
			hashFile(new URL(recipe.image!, imageDirectory)),
		).resolves.toStrictEqual(sampleImageHashes.webp);
		await expect(listImages()).resolves.toStrictEqual([recipe.image]);

		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const secondImage = await readFile(sampleImagePaths.png);
		await recipe.updateImage(secondImage);

		expect(Recipe.fromRecipeId(recipe.recipeId)!.image).toStrictEqual(
			recipe.image,
		);

		await expect(
			hashFile(new URL(recipe.image!, imageDirectory)),
		).resolves.toStrictEqual(sampleImageHashes.png);
		await expect(listImages()).resolves.toStrictEqual([recipe.image]);
	},
);

apiTest(
	'Deleting image',
	async ({api: {User, Recipe, listImages, imageDirectory}}) => {
		const user = User.create('gfyju', 'nlwik', 'lkkpy', UserRoles.User);
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const image = await readFile(sampleImagePaths.png);

		const recipe = await Recipe.create(
			'recipe',
			user,
			image,
			undefined,
			[],
			['add @pasta'],
		);

		await expect(
			hashFile(new URL(recipe.image!, imageDirectory)),
		).resolves.toStrictEqual(sampleImageHashes.png);
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
	},
);

apiTest(
	'Accepts image/jpeg, image/png, image/webp',
	async ({api: {Recipe, User}}) => {
		const user = User.create('pvcif', 'omkdm', 'kjpzh', UserRoles.User);
		const recipe = await Recipe.create(
			'recipe',
			user,
			undefined,
			undefined,
			[],
			['add @popcorn'],
		);

		for (const path of [
			sampleImagePaths.jpg,
			sampleImagePaths.png,
			sampleImagePaths.webp,
		]) {
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			const image = await readFile(path);
			await recipe.updateImage(image);
		}
	},
);

apiTest(
	'Rejects non-images or unsupported image types',
	async ({api: {Recipe, User, listImages}}) => {
		const user = User.create('gxdwb', 'fjiug', 'aznpe', UserRoles.User);
		const recipe = await Recipe.create(
			'recipe',
			user,
			undefined,
			undefined,
			[],
			['add @apples'],
		);

		// eslint-disable-next-line security/detect-non-literal-fs-filename
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
	const user = User.create('aqosq', 'dicvr', 'leoiu', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe',
		user,
		undefined,
		undefined,
		[],
		['add @tofu'],
	);

	// eslint-disable-next-line security/detect-non-literal-fs-filename
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
	const user = User.create('ctiah', 'sdfaa', 'sevbq', UserRoles.User);

	await Promise.all(
		Array.from({length: 25}, (_v, index) =>
			Recipe.create(`recipe ${index}`, user, undefined, undefined, [], []),
		),
	);

	expect(Recipe.all()).toHaveLength(25);

	const firstTen = Recipe.paginate({page: 1, limit: 10});
	expect(firstTen.items).toHaveLength(10);
	expect(firstTen.page).toStrictEqual(1);
	expect(firstTen.lastPage).toStrictEqual(3);
	expect(firstTen.perPageLimit).toStrictEqual(10);
	expect(firstTen.getPreviousPage()).toStrictEqual(false);
	expect(firstTen.getNextPage()).toStrictEqual(2);

	const nextTen = Recipe.paginate({page: 2, limit: 10});
	expect(nextTen.items).toHaveLength(10);
	expect(nextTen.page).toStrictEqual(2);
	expect(nextTen.lastPage).toStrictEqual(3);
	expect(nextTen.perPageLimit).toStrictEqual(10);
	expect(nextTen.getPreviousPage()).toStrictEqual(1);
	expect(nextTen.getNextPage()).toStrictEqual(3);

	const lastFive = Recipe.paginate({page: 3, limit: 10});
	expect(lastFive.items).toHaveLength(5);
	expect(lastFive.page).toStrictEqual(3);
	expect(lastFive.lastPage).toStrictEqual(3);
	expect(lastFive.perPageLimit).toStrictEqual(10);
	expect(lastFive.getPreviousPage()).toStrictEqual(2);
	expect(lastFive.getNextPage()).toStrictEqual(false);

	const paginatedIds = new Set(
		[...firstTen.items, ...nextTen.items, ...lastFive.items].map(
			recipe => recipe.recipeId,
		),
	);
	const expectedIds = new Set(Recipe.all().map(recipe => recipe.recipeId));
	expect(paginatedIds).toStrictEqual(expectedIds);
});

apiTest('Updating sections', async ({api: {User, Recipe}}) => {
	const user = User.create('tlgwb', 'xumdn', 'uammq', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		undefined,
		[],
		['Add @pineapple', 'Stir with #mixer'],
	);

	const oldSections = recipe.sections;
	expect(JSON.stringify(oldSections)).toMatchSnapshot();

	recipe.updateSections(['Fold in @cream', 'Blend with #blender']);

	expect(recipe.sections).not.toStrictEqual(oldSections);
	expect(JSON.stringify(recipe.sections)).toMatchSnapshot();
});

apiTest('Updating title', async ({api: {User, Recipe}}) => {
	const user = User.create('vxswz', 'pywkf', 'jiqje', UserRoles.User);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		undefined,
		[],
		['add @sugar'],
	);

	expect(recipe.title).toStrictEqual('recipe 1');

	recipe.updateTitle('Cool Recipe');
	expect(recipe.title).toStrictEqual('Cool Recipe');

	expect(Recipe.fromRecipeId(recipe.recipeId)!.title).toStrictEqual(
		'Cool Recipe',
	);
});

apiTest('Recipe permissions', async ({api: {User, Recipe}}) => {
	const user = User.create('aqrjl', 'lsfen', 'raukq', UserRoles.User);
	const admin = User.create('asbwf', 'jdhyn', 'taknj', UserRoles.Admin);
	const owner = User.create('nfrpb', 'pwnnb', 'mfncj', UserRoles.Owner);

	const recipeUser = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		undefined,
		[],
		['add @broccoli'],
	);
	const recipeAdmin = await Recipe.create(
		'recipe 2',
		admin,
		undefined,
		undefined,
		[],
		['add @peaches'],
	);
	const recipeOwner = await Recipe.create(
		'recipe 3',
		owner,
		undefined,
		undefined,
		[],
		['add @chocolate'],
	);

	expect(Recipe.permissionToCreateRecipe(user)).toStrictEqual(true);
	expect(Recipe.permissionToCreateRecipe(admin)).toStrictEqual(true);
	expect(Recipe.permissionToCreateRecipe(owner)).toStrictEqual(true);

	expect(recipeUser.permissionToModifyRecipe(user)).toStrictEqual(true);
	expect(recipeUser.permissionToModifyRecipe(admin)).toStrictEqual(true);
	expect(recipeUser.permissionToModifyRecipe(owner)).toStrictEqual(true);

	expect(recipeAdmin.permissionToModifyRecipe(user)).toStrictEqual(false);
	expect(recipeAdmin.permissionToModifyRecipe(admin)).toStrictEqual(true);
	expect(recipeAdmin.permissionToModifyRecipe(owner)).toStrictEqual(true);

	expect(recipeOwner.permissionToModifyRecipe(user)).toStrictEqual(false);
	expect(recipeOwner.permissionToModifyRecipe(admin)).toStrictEqual(true);
	expect(recipeOwner.permissionToModifyRecipe(owner)).toStrictEqual(true);
});

apiTest('Recipe search pagination', async ({api: {Recipe, User}}) => {
	const user = User.create('xdshb', 'dcuml', 'rkkec', UserRoles.User);

	await Promise.all(
		Array.from({length: 50}).map((_v, index) =>
			Recipe.create(
				`Banana Cake ${index}`,
				user,
				undefined,
				undefined,
				['banana', 'cake', index.toString(10)],
				[`Banana Cake No. ${index}`],
			),
		),
	);

	// First page
	const page1_5per = Recipe.search({
		limit: 5,
		page: 1,
		query: 'banana',
	});

	expect(page1_5per.items).toHaveLength(5);
	expect(page1_5per.getPreviousPage()).toStrictEqual(false);
	expect(page1_5per.getNextPage()).toStrictEqual(2);
	expect(page1_5per.lastPage).toBeUndefined();
	expect(page1_5per.perPageLimit).toStrictEqual(5);

	// Last page, page can be filled with limit
	const page10_5per = Recipe.search({
		limit: 5,
		page: 10,
		query: 'banana',
	});

	expect(page10_5per.items).toHaveLength(5);
	expect(page10_5per.getPreviousPage()).toStrictEqual(9);
	expect(page10_5per.getNextPage()).toStrictEqual(false);
	expect(page10_5per.lastPage).toStrictEqual(10);
	expect(page10_5per.perPageLimit).toStrictEqual(5);

	// Recipes running on next page means it won't know how many pages
	// 43..=49 means next page will have 1
	const page7_7per = Recipe.search({
		limit: 7,
		page: 7,
		query: 'banana',
	});
	expect(page7_7per.items).toHaveLength(7);
	expect(page7_7per.getPreviousPage()).toStrictEqual(6);
	expect(page7_7per.getNextPage()).toStrictEqual(8);
	expect(page7_7per.lastPage).toBeUndefined();
	expect(page7_7per.perPageLimit).toStrictEqual(7);

	// Recipes run out before limit is reached
	const page8_7per = Recipe.search({
		limit: 7,
		page: 8,
		query: 'banana',
	});
	expect(page8_7per.items).toHaveLength(1);
	expect(page8_7per.getPreviousPage()).toStrictEqual(7);
	expect(page8_7per.getNextPage()).toStrictEqual(false);
	expect(page8_7per.lastPage).toStrictEqual(8);
	expect(page8_7per.perPageLimit).toStrictEqual(7);

	// Short-circuit. Even though query matches all recipes
	// there aren't enough recipes for there to be a page 20
	const page20_5per = Recipe.search({
		limit: 5,
		page: 20,
		query: 'banana',
	});
	expect(page20_5per.items).toHaveLength(0);
	// due to short-circuit there is no way for it to know
	// what the max page count is
	expect(page20_5per.getPreviousPage()).toStrictEqual(19);
	expect(page20_5per.getNextPage()).toStrictEqual(false);
	expect(page20_5per.lastPage).toBeUndefined();
	expect(page20_5per.perPageLimit).toStrictEqual(5);
});
