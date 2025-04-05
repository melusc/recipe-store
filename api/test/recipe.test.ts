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

import {readFile} from 'node:fs/promises';

import {expect} from 'vitest';

import {ImageSaveType} from '../src/api/image.js';
import {UserRoles} from '../src/index.js';

import {
	apiTest,
	hashFile,
	sampleImageHashes,
	sampleImagePaths,
} from './utilities.js';

apiTest('Creating recipe', async ({api: {User, Recipe}}) => {
	const timeBeforeCreation = Date.now();
	const user = User.create('vaoeo', 'fybec', 'lqizk', UserRoles.User, false);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		undefined,
		undefined,
		['vegetarian'],
		['Add @eggs'],
	);

	expect(recipe.author?.userId).toStrictEqual(user.userId);
	expect(recipe.createdAt.getTime()).toBeGreaterThanOrEqual(timeBeforeCreation);
	expect(recipe.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
	expect(recipe.image).toBeUndefined();
	expect(recipe.sections).toHaveLength(1);
	expect(recipe.tags).toStrictEqual(['vegetarian']);
	expect(recipe.title).toStrictEqual('recipe 1');

	await expect(Recipe.fromRecipeId(recipe.recipeId)).resolves.toStrictEqual(
		recipe,
	);
});

apiTest('fromRecipeId non-existant', async ({api: {Recipe}}) => {
	await expect(Recipe.fromRecipeId(-3)).resolves.toBeUndefined();
});

apiTest(
	'fromRecipeId without tags and sections',
	async ({api: {Recipe, User}}) => {
		const user = User.create('vcesn', 'acwtv', 'pxsmo', UserRoles.User, false);
		const recipe = await Recipe.create(
			'recipe 1',
			user,
			undefined,
			undefined,
			undefined,
			[],
			[],
		);

		const recipeFetched = await Recipe.fromRecipeId(recipe.recipeId);
		expect(recipeFetched).toBeDefined();
		expect(recipeFetched!.tags).toHaveLength(0);
		expect(recipeFetched!.sections).toHaveLength(0);
	},
);

apiTest('Adding tags', async ({api: {User, Recipe}}) => {
	const user = User.create('ioxow', 'fphkp', 'xsxrg', UserRoles.User, false);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		undefined,
		undefined,
		['vegetarian'],
		['Add @banana'],
	);

	expect(recipe.tags).toStrictEqual(['vegetarian']);
	expect((await Recipe.fromRecipeId(recipe.recipeId))!.tags).toStrictEqual(
		recipe.tags,
	);

	const oldUpdatedAt = recipe.updatedAt;

	// Do nothing sluggify('VEGETARIAN') === sluggify('vegetarian')
	recipe.addTag('VEGETARIAN');

	expect(recipe.tags).toStrictEqual(['vegetarian']);
	expect((await Recipe.fromRecipeId(recipe.recipeId))!.tags).toStrictEqual(
		recipe.tags,
	);
	expect(recipe.updatedAt.getTime()).toStrictEqual(oldUpdatedAt.getTime());

	recipe.addTag('sweet');

	expect(recipe.tags).toStrictEqual(['sweet', 'vegetarian']);
	expect((await Recipe.fromRecipeId(recipe.recipeId))!.tags).toStrictEqual(
		recipe.tags,
	);
	expect(recipe.updatedAt.getTime()).toBeGreaterThanOrEqual(
		oldUpdatedAt.getTime(),
	);
});

apiTest('Removing tags', async ({api: {User, Recipe}}) => {
	const user = User.create('zwpfg', 'rcufb', 'vpjzj', UserRoles.User, false);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
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
	expect((await Recipe.fromRecipeId(recipe.recipeId))!.tags).toStrictEqual(
		recipe.tags,
	);

	recipe.clearTags();
	expect(recipe.tags).toStrictEqual([]);
	expect((await Recipe.fromRecipeId(recipe.recipeId))!.tags).toStrictEqual([]);
});

apiTest('Adding image', async ({api: {User, Recipe, listImages, Image}}) => {
	const user = User.create('xnntr', 'slnhb', 'mrmbp', UserRoles.User, false);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		undefined,
		undefined,
		[],
		['add @cinnamon'],
	);

	expect(recipe.image).toBeUndefined();
	await expect(listImages()).resolves.toStrictEqual([]);

	expect((await Recipe.fromRecipeId(recipe.recipeId))!.image).toBeUndefined();

	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const newImageBuffer = await readFile(sampleImagePaths.jpg);
	const newImage = await Image.create(
		newImageBuffer,
		ImageSaveType.PermanentImage,
	);
	await recipe.updateImage(newImage);

	await expect(listImages()).resolves.toStrictEqual([recipe.image!.name]);
	await expect(hashFile(await recipe.image!.read())).resolves.toStrictEqual(
		sampleImageHashes.jpg,
	);

	expect((await Recipe.fromRecipeId(recipe.recipeId))!.image).toStrictEqual(
		recipe.image,
	);
});

apiTest('Replacing image', async ({api: {User, Recipe, listImages, Image}}) => {
	const user = User.create('ajops', 'dbukz', 'xrcnm', UserRoles.User, false);
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const firstImageBuffer = await readFile(sampleImagePaths.webp);
	const firstImage = await Image.create(
		firstImageBuffer,
		ImageSaveType.PermanentImage,
	);

	const recipe = await Recipe.create(
		'recipe',
		user,
		firstImage,
		undefined,
		undefined,
		[],
		['add @rice'],
	);

	expect(
		(await Recipe.fromRecipeId(recipe.recipeId))!.image!.name,
	).toStrictEqual(recipe.image!.name);

	await expect(hashFile(await recipe.image!.read())).resolves.toStrictEqual(
		sampleImageHashes.webp,
	);
	await expect(listImages()).resolves.toStrictEqual([recipe.image!.name]);

	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const secondImageBuffer = await readFile(sampleImagePaths.png);
	const secondImage = await Image.create(
		secondImageBuffer,
		ImageSaveType.PermanentImage,
	);
	await recipe.updateImage(secondImage);

	expect((await Recipe.fromRecipeId(recipe.recipeId))!.image).toStrictEqual(
		recipe.image,
	);

	await expect(hashFile(await recipe.image!.read())).resolves.toStrictEqual(
		sampleImageHashes.png,
	);
	await expect(listImages()).resolves.toStrictEqual([recipe.image!.name]);
});

apiTest('Deleting image', async ({api: {User, Recipe, listImages, Image}}) => {
	const user = User.create('gfyju', 'nlwik', 'lkkpy', UserRoles.User, false);
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const imageBuffer = await readFile(sampleImagePaths.png);
	const image = await Image.create(imageBuffer, ImageSaveType.PermanentImage);

	const recipe = await Recipe.create(
		'recipe',
		user,
		image,
		undefined,
		undefined,
		[],
		['add @pasta'],
	);

	await expect(hashFile(await recipe.image!.read())).resolves.toStrictEqual(
		sampleImageHashes.png,
	);
	await expect(listImages()).resolves.toStrictEqual([recipe.image!.name]);

	expect((await Recipe.fromRecipeId(recipe.recipeId))!.image).toStrictEqual(
		recipe.image,
	);

	await recipe.updateImage(undefined);

	expect(recipe.image).toBeUndefined();
	expect((await Recipe.fromRecipeId(recipe.recipeId))!.image).toStrictEqual(
		recipe.image,
	);

	await expect(listImages()).resolves.toStrictEqual([]);
});

apiTest(
	'Accepts image/jpeg, image/png, image/webp',
	async ({api: {Recipe, User, Image}}) => {
		const user = User.create('pvcif', 'omkdm', 'kjpzh', UserRoles.User, false);
		const recipe = await Recipe.create(
			'recipe',
			user,
			undefined,
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
			const imageBuffer = await readFile(path);
			const image = await Image.create(
				imageBuffer,
				ImageSaveType.PermanentImage,
			);
			await recipe.updateImage(image);
		}
	},
);

apiTest(
	'Recipe source without starting source',
	async ({api: {Recipe, User}}) => {
		const user = User.create('jfthz', 'fmypp', 'uneff', UserRoles.User, false);
		const recipe = await Recipe.create(
			'recipe 1',
			user,
			undefined,
			undefined,
			undefined,
			[],
			[],
		);

		expect(recipe.source).toBeUndefined();
		expect(
			(await Recipe.fromRecipeId(recipe.recipeId))!.source,
		).toBeUndefined();

		recipe.updateSource('https://bing.com/');
		expect(recipe.source).toStrictEqual('https://bing.com/');
		expect((await Recipe.fromRecipeId(recipe.recipeId))!.source).toStrictEqual(
			'https://bing.com/',
		);
	},
);

apiTest('Recipe source with starting source', async ({api: {Recipe, User}}) => {
	const user = User.create('ejmpy', 'epnte', 'xltmf', UserRoles.User, false);
	const recipe = await Recipe.create(
		'recipe 2',
		user,
		undefined,
		'https://google.com/',
		undefined,
		[],
		[],
	);

	expect(recipe.source).toStrictEqual('https://google.com/');
	expect((await Recipe.fromRecipeId(recipe.recipeId))!.source).toStrictEqual(
		'https://google.com/',
	);

	recipe.updateSource(undefined);
	expect(recipe.source).toBeUndefined();
	expect((await Recipe.fromRecipeId(recipe.recipeId))!.source).toBeUndefined();
});

apiTest(
	'Recipe duration without initial duration',
	async ({api: {Recipe, User}}) => {
		const user = User.create('jfthz', 'fmypp', 'uneff', UserRoles.User, false);
		const recipe = await Recipe.create(
			'recipe 1',
			user,
			undefined,
			undefined,
			undefined,
			[],
			[],
		);

		expect(recipe.duration).toBeUndefined();
		expect(
			(await Recipe.fromRecipeId(recipe.recipeId))!.duration,
		).toBeUndefined();

		recipe.updateDuration('60 minutes');
		expect(recipe.duration).toStrictEqual('60 minutes');
		expect(
			(await Recipe.fromRecipeId(recipe.recipeId))!.duration,
		).toStrictEqual('60 minutes');
	},
);

apiTest(
	'Recipe duration with starting duration',
	async ({api: {Recipe, User}}) => {
		const user = User.create('ejmpy', 'epnte', 'xltmf', UserRoles.User, false);
		const recipe = await Recipe.create(
			'recipe 2',
			user,
			undefined,
			'https://google.com/',
			'60 min',
			[],
			[],
		);

		expect(recipe.duration).toStrictEqual('60 min');
		expect(
			(await Recipe.fromRecipeId(recipe.recipeId))!.duration,
		).toStrictEqual('60 min');

		recipe.updateDuration(undefined);
		expect(recipe.duration).toBeUndefined();
		expect(
			(await Recipe.fromRecipeId(recipe.recipeId))!.duration,
		).toBeUndefined();
	},
);

apiTest('Paginate', async ({api: {User, Recipe}}) => {
	const user = User.create('ctiah', 'sdfaa', 'sevbq', UserRoles.User, false);

	await Promise.all(
		Array.from({length: 25}, (_v, index) =>
			Recipe.create(
				`recipe ${index}`,
				user,
				undefined,
				undefined,
				undefined,
				[],
				[],
			),
		),
	);

	await expect(Recipe.all()).resolves.toHaveLength(25);

	const firstTen = await Recipe.paginate({page: 1, limit: 10});
	expect(firstTen.items).toHaveLength(10);
	expect(firstTen.page).toStrictEqual(1);
	expect(firstTen.lastPage).toStrictEqual(3);
	expect(firstTen.perPageLimit).toStrictEqual(10);
	expect(firstTen.getPreviousPage()).toStrictEqual(false);
	expect(firstTen.getNextPage()).toStrictEqual(2);

	const nextTen = await Recipe.paginate({page: 2, limit: 10});
	expect(nextTen.items).toHaveLength(10);
	expect(nextTen.page).toStrictEqual(2);
	expect(nextTen.lastPage).toStrictEqual(3);
	expect(nextTen.perPageLimit).toStrictEqual(10);
	expect(nextTen.getPreviousPage()).toStrictEqual(1);
	expect(nextTen.getNextPage()).toStrictEqual(3);

	const lastFive = await Recipe.paginate({page: 3, limit: 10});
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
	const allRecipes = await Recipe.all();
	const expectedIds = new Set(allRecipes.map(recipe => recipe.recipeId));
	expect(paginatedIds).toStrictEqual(expectedIds);
});

apiTest('Updating sections', async ({api: {User, Recipe}}) => {
	const user = User.create('tlgwb', 'xumdn', 'uammq', UserRoles.User, false);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
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
	const user = User.create('vxswz', 'pywkf', 'jiqje', UserRoles.User, false);
	const recipe = await Recipe.create(
		'recipe 1',
		user,
		undefined,
		undefined,
		undefined,
		[],
		['add @sugar'],
	);

	expect(recipe.title).toStrictEqual('recipe 1');

	recipe.updateTitle('Cool Recipe');
	expect(recipe.title).toStrictEqual('Cool Recipe');

	expect((await Recipe.fromRecipeId(recipe.recipeId))!.title).toStrictEqual(
		'Cool Recipe',
	);
});

apiTest('Recipe permissions', async ({api: {User, Recipe}}) => {
	const user = User.create('aqrjl', 'lsfen', 'raukq', UserRoles.User, false);
	const admin = User.create('asbwf', 'jdhyn', 'taknj', UserRoles.Admin, false);
	const owner = User.create('nfrpb', 'pwnnb', 'mfncj', UserRoles.Owner, false);

	const recipeUser = await Recipe.create(
		'recipe 1',
		user,
		undefined,
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
		undefined,
		[],
		['add @peaches'],
	);
	const recipeOwner = await Recipe.create(
		'recipe 3',
		owner,
		undefined,
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
	const user = User.create('xdshb', 'dcuml', 'rkkec', UserRoles.User, false);

	await Promise.all(
		Array.from({length: 50}).map((_v, index) =>
			Recipe.create(
				`Banana Cake ${index}`,
				user,
				undefined,
				undefined,
				undefined,
				['banana', 'cake', index.toString(10)],
				[`Banana Cake No. ${index}`],
			),
		),
	);

	// First page
	const page1_5per = await Recipe.search({
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
	const page10_5per = await Recipe.search({
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
	const page7_7per = await Recipe.search({
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
	const page8_7per = await Recipe.search({
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
	const page20_5per = await Recipe.search({
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
