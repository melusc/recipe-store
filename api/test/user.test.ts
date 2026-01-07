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

import {expect} from 'vitest';

import {UserDeletion} from '../src/api/user.js';
import {ApiError, UserRoles} from '../src/index.js';

import {apiTest} from './utilities.js';

apiTest('User creation', ({api: {User}}) => {
	const timeBeforeCreation = Date.now();
	const user = User.create('dzvfo', 'xhyzd', 'ipdmy', UserRoles.Admin, false);
	const other = User.create('aogqu', 'fliwc', 'zlqie', UserRoles.User, false);

	const userById = User.fromUserid(user.userId);
	const userByUsername = User.fromUsername(user.username);

	expect(userById).toStrictEqual(user);
	expect(userByUsername).toStrictEqual(user);

	expect(user).not.toStrictEqual(other);

	expect(user.role).toStrictEqual(UserRoles.Admin);
	expect(user.roleLabel).toStrictEqual('Admin');
	expect(user.username).toStrictEqual('dzvfo');

	expect(user.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
	expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(timeBeforeCreation);

	expect(user.requirePasswordChange).toStrictEqual(false);
});

apiTest('User login', ({api: {User}}) => {
	const username = 'nfdvi';
	const password = 'nohpj';

	void User.create('dasyq', 'pnyyj', 'yeadn', UserRoles.User, false);
	const {userId} = User.create(
		username,
		username,
		password,
		UserRoles.Admin,
		false,
	);

	const userLogin = User.login(username, password);

	expect(userLogin.userId).toStrictEqual(userId);
});

apiTest('Change password of user', ({api: {User}}) => {
	const username = 'fnabk';
	const password = 'ylloa';
	const newPassword = 'trywo';

	const user = User.create(username, username, password, UserRoles.User, true);
	const oldUpdatedAt = user.updatedAt;
	const oldPasswordLastChanged = user.passwordLastChanged;

	expect(user.requirePasswordChange).toStrictEqual(true);

	expect(() => {
		user.changePassword('wrong-old-password', newPassword);
	}).toThrow(ApiError);

	user.changePassword(password, newPassword);

	expect(() => {
		User.login(username, password);
	}).toThrow(ApiError);

	expect(User.login(username, newPassword)).toStrictEqual(user);
	expect(user.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
	expect(user.passwordLastChanged.getTime()).toBeGreaterThan(
		oldPasswordLastChanged.getTime(),
	);

	expect(user.requirePasswordChange).toStrictEqual(false);
});

apiTest('Reset password reset of user', ({api: {User}}) => {
	const username = 'ksusz';
	const password = 'yctfp';
	const newPassword = 'dxhhh';

	const user = User.create(username, username, password, UserRoles.Admin, true);
	const oldUpdatedAt = user.updatedAt;
	const oldPasswordLastChanged = user.passwordLastChanged;

	expect(user.requirePasswordChange).toStrictEqual(true);
	user.resetPassword(newPassword);

	expect(() => {
		User.login(username, password);
	}).toThrow(ApiError);

	expect(User.login(username, newPassword)).toStrictEqual(user);

	expect(user.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
	expect(user.passwordLastChanged.getTime()).toBeGreaterThan(
		oldPasswordLastChanged.getTime(),
	);

	expect(user.requirePasswordChange).toStrictEqual(false);
});

apiTest('Confirm password of user', ({api: {User}}) => {
	const username = 'cafzy';
	const password = 'arcsj';

	const user = User.create(username, username, password, UserRoles.User, false);

	// Doesn't throw
	user.confirmPassword(password);

	expect(() => {
		user.confirmPassword('not-password');
	}).toThrow(ApiError);
});

apiTest('Change username', ({api: {User}}) => {
	const usernameOld = 'abotw';
	const usernameNew = 'mqyzc';
	const password = 'wtaae';

	const user = User.create(
		usernameOld,
		usernameOld,
		password,
		UserRoles.User,
		false,
	);
	expect(user.username).toStrictEqual(usernameOld);
	const oldUpdatedAt = user.updatedAt;

	user.changeUsername(usernameNew);
	expect(user.username).toStrictEqual(usernameNew);

	expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
		oldUpdatedAt.getTime(),
	);

	expect(User.fromUsername(usernameOld)).toBeUndefined();
	expect(User.fromUsername(usernameNew)).toBeDefined();
});

apiTest('Change role of user', ({api: {User}}) => {
	const user = User.create('emjsd', 'wabjh', 'ribvw', UserRoles.User, false);
	const oldUpdatedAt = user.updatedAt;

	expect(user.role).toStrictEqual(UserRoles.User);
	expect(user.roleLabel).toStrictEqual('User');

	user.changeRole(UserRoles.Admin);
	expect(user.role).toStrictEqual(UserRoles.Admin);
	expect(user.roleLabel).toStrictEqual('Admin');

	expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
		oldUpdatedAt.getTime(),
	);

	const userFound = User.fromUserid(user.userId);
	expect(userFound?.role).toStrictEqual(UserRoles.Admin);
});

apiTest('Delete user without recipes', async ({api: {User}}) => {
	const username = 'prrmx';
	const password = 'rftef';
	const user = User.create(
		username,
		username,
		password,
		UserRoles.Admin,
		false,
	);

	await user.deleteUser(UserDeletion.KeepRecipes);

	expect(User.fromUsername(username)).toBeUndefined();
	expect(User.fromUserid(user.userId)).toBeUndefined();
	// -1 is the deleted user but it doesn't exist!
	expect(User.fromUserid(-1)).toBeUndefined();
});

apiTest('Delete user, keep recipes', async ({api: {User, Recipe}}) => {
	const user1 = User.create('fadus', 'abccm', 'fnudy', UserRoles.User, false);
	const user2 = User.create('tdjdj', 'paqfn', 'xaoyu', UserRoles.User, false);

	const recipe1 = await Recipe.create(
		'recipe 1',
		user1,
		undefined,
		undefined,
		undefined,
		[],
		['add @sunflower seeds{}'],
	);

	const recipe2 = await Recipe.create(
		'recipe 2',
		user2,
		undefined,
		undefined,
		undefined,
		[],
		['add @basil'],
	);

	await user1.deleteUser(UserDeletion.KeepRecipes);

	expect(User.all()).toHaveLength(1);

	const recipes = await Recipe.all();
	expect(recipes).toHaveLength(2);

	// `recipe1` will not "know" that `user1` has been deleted
	// Only on requery will it "know"
	expect((await Recipe.fromRecipeId(recipe1.recipeId))!.author).toBeUndefined();
	expect(
		(await Recipe.fromRecipeId(recipe2.recipeId))!.author!.username,
	).toStrictEqual('tdjdj');
});

apiTest('Delete user, delete recipes', async ({api: {User, Recipe}}) => {
	const user1 = User.create('cnjxu', 'pzypq', 'lskih', UserRoles.User, false);
	const user2 = User.create('grnly', 'kfksr', 'ccfqi', UserRoles.User, false);

	await Recipe.create(
		'recipe 1',
		user1,
		undefined,
		undefined,
		undefined,
		[],
		['add @milk'],
	);

	const recipe2 = await Recipe.create(
		'recipe 2',
		user2,
		undefined,
		undefined,
		undefined,
		[],
		['add @carrots'],
	);

	await user1.deleteUser(UserDeletion.DeleteRecipes);

	await expect(Recipe.all()).resolves.toStrictEqual([recipe2]);
	expect(User.all()).toStrictEqual([user2]);
});

apiTest('List recipes created by user', async ({api: {User, Recipe}}) => {
	const user1 = User.create('hoatt', 'zhvkn', 'sgghj', UserRoles.User, false);
	const user2 = User.create('qhqkq', 'bhwod', 'enhgp', UserRoles.User, false);

	for (let index = 0; index < 20; ++index) {
		await Recipe.create(
			`recipe ${index}`,
			index & 1 ? user1 : user2,
			undefined,
			undefined,
			undefined,
			[],
			[`Add @salt{${index}%tbsp}`],
		);
	}

	const user1Recipes = await user1.listRecipes();
	const user2Recipes = await user2.listRecipes();

	expect(user1Recipes).toHaveLength(10);
	expect(user2Recipes).toHaveLength(10);

	for (const recipe of user1Recipes) {
		// odd recipes
		expect(recipe.title).toMatch(/^recipe \d*[13579]$/i);
	}

	for (const recipe of user2Recipes) {
		// even recipes
		expect(recipe.title).toMatch(/^recipe \d*[02468]$/i);
	}
});

apiTest('Paginate users', ({api: {User}}) => {
	const emptyPaginated = User.paginate({limit: 50, page: 1});
	expect(emptyPaginated.items).toHaveLength(0);
	expect(emptyPaginated.getNextPage()).toStrictEqual(false);
	expect(emptyPaginated.getPreviousPage()).toStrictEqual(false);
	expect(emptyPaginated.page).toStrictEqual(1);
	expect(emptyPaginated.lastPage).toStrictEqual(0);
	expect(emptyPaginated.perPageLimit).toStrictEqual(50);

	for (let index = 0; index < 12; ++index) {
		User.create(
			`dilxe${index}`,
			`dilxe${index}`,
			'pzzwf',
			UserRoles.User,
			false,
		);
	}

	const page1 = User.paginate({limit: 10, page: 1});
	const page2 = User.paginate({limit: 10, page: 2});

	expect(page1.items).toHaveLength(10);
	expect(page1.getNextPage()).toStrictEqual(2);
	expect(page1.getPreviousPage()).toStrictEqual(false);
	expect(page1.page).toStrictEqual(1);
	expect(page1.lastPage).toStrictEqual(2);
	expect(page1.perPageLimit).toStrictEqual(10);

	expect(page2.items).toHaveLength(2);
	expect(page2.getNextPage()).toStrictEqual(false);
	expect(page2.getPreviousPage()).toStrictEqual(1);
	expect(page2.page).toStrictEqual(2);
	expect(page2.lastPage).toStrictEqual(2);
	expect(page2.perPageLimit).toStrictEqual(10);

	expect(
		new Set([...page1.items, ...page2.items].map(user => user.userId)),
	).toHaveLength(12);
});

apiTest('Paginate recipes created by user', async ({api: {User, Recipe}}) => {
	const user1 = User.create('wacws', 'tejci', 'gmaiu', UserRoles.User, false);
	const user2 = User.create('plvsh', 'yajsk', 'xumto', UserRoles.User, false);

	for (let index = 0; index < 50; ++index) {
		await Recipe.create(
			`recipe ${index}`,
			index & 1 ? user1 : user2,
			undefined,
			undefined,
			undefined,
			[],
			[`Add @salt{${index}%tbsp}`],
		);
	}

	const firstTen = await user1.paginateRecipes({page: 1, limit: 10});
	expect(firstTen.items).toHaveLength(10);
	expect(firstTen.page).toStrictEqual(1);
	expect(firstTen.lastPage).toStrictEqual(3);
	expect(firstTen.perPageLimit).toStrictEqual(10);
	expect(firstTen.getPreviousPage()).toStrictEqual(false);
	expect(firstTen.getNextPage()).toStrictEqual(2);

	const nextTen = await user1.paginateRecipes({page: 2, limit: 10});
	expect(nextTen.items).toHaveLength(10);
	expect(nextTen.page).toStrictEqual(2);
	expect(nextTen.lastPage).toStrictEqual(3);
	expect(nextTen.perPageLimit).toStrictEqual(10);
	expect(nextTen.getPreviousPage()).toStrictEqual(1);
	expect(nextTen.getNextPage()).toStrictEqual(3);

	const finalFive = await user1.paginateRecipes({page: 3, limit: 10});
	expect(finalFive.items).toHaveLength(5);
	expect(finalFive.page).toStrictEqual(3);
	expect(finalFive.lastPage).toStrictEqual(3);
	expect(finalFive.perPageLimit).toStrictEqual(10);
	expect(finalFive.getPreviousPage()).toStrictEqual(2);
	expect(finalFive.getNextPage()).toStrictEqual(false);

	const ids = [...firstTen.items, ...nextTen.items, ...finalFive.items].map(
		recipe => recipe.recipeId,
	);
	expect(new Set(ids)).toHaveLength(25);
});

apiTest('Change display name', ({api: {User}}) => {
	const nameOld = 'yycek';
	const nameNew = 'ndiqo';

	const user = User.create(nameOld, nameOld, 'ituej', UserRoles.Owner, false);
	const beforeUpdated = Date.now();

	expect(user.displayName).toStrictEqual(nameOld);
	expect(User.fromUserid(user.userId)!.displayName).toStrictEqual(nameOld);

	user.changeDisplayName(nameNew);
	expect(user.displayName).toStrictEqual(nameNew);
	expect(User.fromUserid(user.userId)!.displayName).toStrictEqual(nameNew);

	expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdated);
	expect(user.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
});

apiTest('User permissions', ({api: {User}}) => {
	const owner1 = User.create('rbzko', 'ciwdu', 'hvfpi', UserRoles.Owner, false);
	const owner2 = User.create('lllwz', 'ehhzf', 'dzqzt', UserRoles.Owner, false);

	const admin1 = User.create('xtwss', 'sfyps', 'gzrep', UserRoles.Admin, false);
	const admin2 = User.create('vdzgf', 'agwbg', 'pfkyl', UserRoles.Admin, false);

	const user1 = User.create('tmztj', 'dcufr', 'ziydr', UserRoles.User, false);
	const user2 = User.create('tudcu', 'nogqf', 'mkbbg', UserRoles.User, false);

	// I think this is the most readable even though it is verbose AF
	// No need for some abstraction

	// =========== permissionToChangeRole ===========

	// Only owner is allowed to modify any roles
	// to allow owner to keep overview and some control
	expect(owner1.permissionToChangeRole(owner2)).toStrictEqual(true);
	expect(owner1.permissionToChangeRole(admin2)).toStrictEqual(true);
	expect(owner1.permissionToChangeRole(user2)).toStrictEqual(true);

	expect(admin1.permissionToChangeRole(owner2)).toStrictEqual(false);
	expect(admin1.permissionToChangeRole(admin2)).toStrictEqual(false);
	expect(admin1.permissionToChangeRole(user2)).toStrictEqual(false);

	expect(user1.permissionToChangeRole(owner2)).toStrictEqual(false);
	expect(user1.permissionToChangeRole(admin2)).toStrictEqual(false);
	expect(user1.permissionToChangeRole(user2)).toStrictEqual(false);

	// =========== permissionToCreateUser ===========

	// Invite-only. Admins need to create an account for you
	expect(owner1.permissionToCreateUser()).toStrictEqual(true);
	expect(admin1.permissionToCreateUser()).toStrictEqual(true);
	expect(user1.permissionToCreateUser()).toStrictEqual(false);

	// =========== permissionToModifyOrDeleteUser ===========

	// Owner allowed to do anything
	expect(owner1.permissionToModifyOrDeleteUser(owner1)).toStrictEqual(true);
	expect(owner1.permissionToModifyOrDeleteUser(owner2)).toStrictEqual(true);
	expect(owner1.permissionToModifyOrDeleteUser(admin1)).toStrictEqual(true);
	expect(owner1.permissionToModifyOrDeleteUser(user1)).toStrictEqual(true);

	// Admin allowed to modify everything if other is less than admin
	// and allowed to modify self
	expect(admin1.permissionToModifyOrDeleteUser(owner1)).toStrictEqual(false);
	expect(admin1.permissionToModifyOrDeleteUser(admin1)).toStrictEqual(true);
	expect(admin1.permissionToModifyOrDeleteUser(admin2)).toStrictEqual(false);
	expect(admin1.permissionToModifyOrDeleteUser(user1)).toStrictEqual(true);

	// User is only allowed to modify self
	expect(user1.permissionToModifyOrDeleteUser(owner1)).toStrictEqual(false);
	expect(user1.permissionToModifyOrDeleteUser(admin1)).toStrictEqual(false);
	expect(user1.permissionToModifyOrDeleteUser(user1)).toStrictEqual(true);
	expect(user1.permissionToModifyOrDeleteUser(user2)).toStrictEqual(false);
});
