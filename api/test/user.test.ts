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

import {expect, test} from 'vitest';

import {ApiError, UserRoles} from '../src/index.js';

import {apiTest} from './util.js';

apiTest('User creation', ({api: {User}}) => {
	const timeBeforeCreation = Date.now();
	const user = User.create('dzvfo', 'ipdmy', UserRoles.Admin);
	const other = User.create('aogqu', 'zlqie', UserRoles.User);

	const userById = User.fromUserid(user.userId);
	const userByUsername = User.fromUsername(user.username);

	expect(userById).to.deep.equal(user);
	expect(userByUsername).to.deep.equal(user);

	expect(user).not.toStrictEqual(other);

	expect(user.role).toStrictEqual(UserRoles.Admin);
	expect(user.username).toStrictEqual('dzvfo');

	expect(user.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
	expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(timeBeforeCreation);
});

apiTest('User login', ({api: {User}}) => {
	const username = 'nfdvi';
	const password = 'nohpj';

	void User.create('dasyq', 'yeadn', UserRoles.User);
	const {userId} = User.create(username, password, UserRoles.Admin);

	const userLogin = User.login(username, password);

	expect(userLogin.userId).toStrictEqual(userId);
});

apiTest('Change password of user', ({api: {User}}) => {
	const username = 'fnabk';
	const password = 'ylloa';
	const newPassword = 'trywo';

	const user = User.create(username, password, UserRoles.User);
	const oldUpdatedAt = user.updatedAt;

	expect(() => {
		user.changePassword('wrong-old-password', newPassword);
	}).to.throw(ApiError);

	user.changePassword(password, newPassword);

	expect(() => {
		User.login(username, password);
	}).to.throw(ApiError);

	expect(User.login(username, newPassword)).to.deep.equal(user);
	expect(user.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
});

apiTest('Reset password reset of user', ({api: {User}}) => {
	const username = 'ksusz';
	const password = 'yctfp';
	const newPassword = 'dxhhh';

	const user = User.create(username, password, UserRoles.Admin);
	const oldUpdatedAt = user.updatedAt;

	user.resetPassword(newPassword);

	expect(() => {
		User.login(username, password);
	}).to.throw(ApiError);

	expect(User.login(username, newPassword)).to.deep.equal(user);

	expect(user.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
});

apiTest('Change username', ({api: {User}}) => {
	const usernameOld = 'abotw';
	const usernameNew = 'mqyzc';
	const password = 'wtaae';

	const user = User.create(usernameOld, password, UserRoles.User);
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
	const user = User.create('emjsd', 'ribvw', UserRoles.User);
	const oldUpdatedAt = user.updatedAt;

	expect(user.role).toStrictEqual(UserRoles.User);

	user.changeRole(UserRoles.Admin);
	expect(user.role).toStrictEqual(UserRoles.Admin);

	expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
		oldUpdatedAt.getTime(),
	);

	const userFound = User.fromUserid(user.userId);
	expect(userFound?.role).toStrictEqual(UserRoles.Admin);
});

apiTest('Delete user without recipes', async ({api: {User}}) => {
	const username = 'prrmx';
	const password = 'rftef';
	const user = User.create(username, password, UserRoles.Admin);

	await user.deleteUser(false);

	expect(User.fromUsername(username)).toBeUndefined();
	expect(User.fromUserid(user.userId)).toBeUndefined();
	// -1 is the deleted user but it doesn't exist!
	expect(User.fromUserid(-1)).toBeUndefined();
});

test.todo('Delete user, keep recipes');
test.todo('Delete user, delete recipes');
test.todo('List recipes created by user');

apiTest('User permissions', ({api: {User}}) => {
	const owner1 = User.create('rbzko', 'hvfpi', UserRoles.Owner);
	const owner2 = User.create('lllwz', 'dzqzt', UserRoles.Owner);

	const admin1 = User.create('xtwss', 'gzrep', UserRoles.Admin);
	const admin2 = User.create('vdzgf', 'pfkyl', UserRoles.Admin);

	const user1 = User.create('tmztj', 'ziydr', UserRoles.User);
	const user2 = User.create('tudcu', 'mkbbg', UserRoles.User);

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
