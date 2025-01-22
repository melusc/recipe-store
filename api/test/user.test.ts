import {expect, test} from 'vitest';

import {ApiError, UserRoles} from '../src/index.js';

import {apiTest} from './util.js';

apiTest('User creation', ({api: {User}}) => {
	const user = User.create('dzvfo', 'ipdmy', UserRoles.Admin);
	const other = User.create('aogqu', 'zlqie', UserRoles.User);

	const userById = User.fromUserid(user.userId);
	const userByUsername = User.fromUsername(user.username);

	expect(userById).to.deep.equal(user);
	expect(userByUsername).to.deep.equal(user);

	expect(user).not.toStrictEqual(other);

	expect(user.role).toStrictEqual(UserRoles.Admin);
	expect(user.username).toStrictEqual('dzvfo');
});

apiTest('User login', ({api: {User}}) => {
	const username = 'nfdvi';
	const password = 'nohpj';

	void User.create('dasyq', 'yeadn', UserRoles.User);
	const {userId} = User.create(username, password, UserRoles.Admin);

	const userLogin = User.login(username, password);

	expect(userLogin.userId).toStrictEqual(userId);
});

apiTest('User password change', ({api: {User}}) => {
	const username = 'fnabk';
	const password = 'ylloa';
	const newPassword = 'trywo';

	const user = User.create(username, password, UserRoles.User);

	expect(() => {
		user.changePassword('wrong-old-password', newPassword);
	}).to.throw(ApiError);

	user.changePassword(password, newPassword);

	expect(() => {
		User.login(username, password);
	}).to.throw(ApiError);

	expect(User.login(username, newPassword)).to.deep.equal(user);
});

apiTest('User password reset', ({api: {User}}) => {
	const username = 'ksusz';
	const password = 'yctfp';
	const newPassword = 'dxhhh';

	const user = User.create(username, password, UserRoles.Admin);

	user.resetPassword(newPassword);

	expect(() => {
		User.login(username, password);
	}).to.throw(ApiError);

	expect(User.login(username, newPassword)).to.deep.equal(user);
});

apiTest('User change username', ({api: {User}}) => {
	const usernameOld = 'abotw';
	const usernameNew = 'mqyzc';
	const password = 'wtaae';

	const user = User.create(usernameOld, password, UserRoles.User);
	expect(user.username).toStrictEqual(usernameOld);

	user.changeUsername(usernameNew);
	expect(user.username).toStrictEqual(usernameNew);

	expect(User.fromUsername(usernameOld)).toBeUndefined();
	expect(User.fromUsername(usernameNew)).toBeDefined();
});

apiTest('User change role', ({api: {User}}) => {
	const user = User.create('emjsd', 'ribvw', UserRoles.User);

	expect(user.role).toStrictEqual(UserRoles.User);

	user.changeRole(UserRoles.Admin);
	expect(user.role).toStrictEqual(UserRoles.Admin);

	const userFound = User.fromUserid(user.userId);
	expect(userFound?.role).toStrictEqual(UserRoles.Admin);
});

apiTest('User delete user', async ({api: {User}}) => {
	const username = 'prrmx';
	const password = 'rftef';
	const user = User.create(username, password, UserRoles.Admin);

	await user.deleteUser(false);

	expect(User.fromUsername(username)).toBeUndefined();
	expect(User.fromUserid(user.userId)).toBeUndefined();
	// -1 is the deleted user but it doesn't exist!
	expect(User.fromUserid(-1)).toBeUndefined();
});

test.todo('User delete user, keep recipes');
test.todo('User delete user, delete recipes');
test.todo('User list recipes of user');

apiTest('Permission', ({api: {User}}) => {
	const owner1 = User.create('rbzko', 'hvfpi', UserRoles.Owner);
	const owner2 = User.create('lllwz', 'dzqzt', UserRoles.Owner);

	const admin1 = User.create('xtwss', 'gzrep', UserRoles.Admin);
	const admin2 = User.create('vdzgf', 'pfkyl', UserRoles.Admin);

	const user1 = User.create('tmztj', 'ziydr', UserRoles.User);
	const user2 = User.create('tudcu', 'mkbbg', UserRoles.User);

	// I think this is the most readable even though it is verbose AF
	// No need for some abstraction

	// =========== permissionToChangeRole ===========

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

	expect(owner1.permissionToCreateUser()).toStrictEqual(true);
	expect(admin1.permissionToCreateUser()).toStrictEqual(true);
	expect(user1.permissionToCreateUser()).toStrictEqual(false);

	// =========== permissionToModifyOrDeleteUser ===========

	expect(owner1.permissionToModifyOrDeleteUser(owner1)).toStrictEqual(true);
	expect(owner1.permissionToModifyOrDeleteUser(owner2)).toStrictEqual(true);
	expect(owner1.permissionToModifyOrDeleteUser(admin1)).toStrictEqual(true);
	expect(owner1.permissionToModifyOrDeleteUser(user1)).toStrictEqual(true);

	expect(admin1.permissionToModifyOrDeleteUser(owner1)).toStrictEqual(false);
	expect(admin1.permissionToModifyOrDeleteUser(admin1)).toStrictEqual(true);
	expect(admin1.permissionToModifyOrDeleteUser(admin2)).toStrictEqual(false);
	expect(admin1.permissionToModifyOrDeleteUser(user1)).toStrictEqual(true);

	expect(user1.permissionToModifyOrDeleteUser(owner1)).toStrictEqual(false);
	expect(user1.permissionToModifyOrDeleteUser(admin1)).toStrictEqual(false);
	expect(user1.permissionToModifyOrDeleteUser(user1)).toStrictEqual(true);
	expect(user1.permissionToModifyOrDeleteUser(user2)).toStrictEqual(false);
});
