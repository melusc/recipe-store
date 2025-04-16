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

import bcrypt from 'bcrypt';

import {ApiError} from './error.js';
import {InjectableApi} from './injectable.js';
import type {Recipe} from './recipe.js';
import {PaginationResult, type ReadonlyDate} from './utilities.js';

// Use integers to indicate hierarchy
// Allows comparison of level using lt and gt operator
// Allow for theoretical future roles with fewer permissions
// than admin but more than user, though unlikely
export enum UserRoles {
	User = 0,
	Admin = 4,
	Owner = 5,
}

export enum UserDeletion {
	DeleteRecipes = 0,
	KeepRecipes = 1,
}

type SqlUserRow = {
	username: string;
	displayname: string;
	role: UserRoles;
	user_id: number;
	require_pw_change: 0 | 1;
	created_at: number;
	updated_at: number;
	password: string;
};

const BASE_SQL_USER_SELECT = `
SELECT username,
       displayname,
       role,
       user_id,
       require_pw_change,
       created_at,
       updated_at,
			 password
FROM   users`;

const HASH_ROUNDS = 10;

const privateConstructorKey = Symbol();

export class User extends InjectableApi {
	// Internally r/w, externally readonly
	private _username: string;
	private _displayName: string;
	private _role: UserRoles;
	private _requirePasswordChange: boolean;
	private _updatedAt: ReadonlyDate;
	private readonly _createdAt: ReadonlyDate;

	constructor(
		readonly userId: number,
		username: string,
		displayName: string,
		role: UserRoles,
		requirePasswordChange: boolean | 0 | 1,
		createdAt: ReadonlyDate,
		updatedAt: ReadonlyDate,
		constructorKey: symbol,
	) {
		if (constructorKey !== privateConstructorKey) {
			throw new TypeError('User.constructor is private.');
		}

		super();

		this._username = username;
		this._displayName = displayName;
		this._role = role;
		this._requirePasswordChange = requirePasswordChange ? true : false;
		this._createdAt = createdAt;
		this._updatedAt = updatedAt;
	}

	get username() {
		return this._username;
	}

	get displayName() {
		return this._displayName;
	}

	get role() {
		return this._role;
	}

	get requirePasswordChange() {
		return this._requirePasswordChange;
	}

	get updatedAt(): ReadonlyDate {
		return new Date(this._updatedAt as Date);
	}

	get createdAt(): ReadonlyDate {
		return new Date(this._createdAt as Date);
	}

	static create(
		username: string,
		displayName: string,
		password: string,
		role: UserRoles,
		requirePasswordChange: boolean,
	) {
		if (this.fromUsername(username)) {
			throw new ApiError('User already exists. Use another username.');
		}

		const passwordHash = bcrypt.hashSync(password, HASH_ROUNDS);
		const createdAt = new Date();

		const {user_id: userId} = this.database
			.prepare(
				`INSERT INTO users (
					username, displayname, password, role,
					require_pw_change, created_at, updated_at
				)
				VALUES (
					:username, :displayName, :passwordHash, :role,
					:requirePasswordChange, :createdAt, :createdAt
				)
				RETURNING user_id`,
			)
			.get({
				username,
				displayName,
				passwordHash,
				role,
				requirePasswordChange: requirePasswordChange ? 1 : 0,
				createdAt: createdAt.getTime(),
			}) as {user_id: number};

		return new this.User(
			userId,
			username,
			displayName,
			role,
			requirePasswordChange,
			createdAt,
			createdAt,
			privateConstructorKey,
		);
	}

	static login(username: string, password: string): User {
		const result = this.database
			.prepare(
				`${BASE_SQL_USER_SELECT}
				WHERE username = :username`,
			)
			.get({username}) as SqlUserRow | undefined;

		const passwordMatch =
			!!result && bcrypt.compareSync(password, result.password);
		if (!passwordMatch) {
			throw new ApiError('Invalid credentials. Please try again.');
		}

		return this._fromRow(result);
	}

	static fromUsername(username: string): User | undefined {
		const result = this.database
			.prepare(
				`${BASE_SQL_USER_SELECT}
				WHERE username = :username`,
			)
			.get({username}) as SqlUserRow | undefined;

		return this._fromRow(result);
	}

	static fromUserid(userId: number): User | undefined {
		// fast path for deleted user
		if (userId === -1) {
			return;
		}

		const result = this.database
			.prepare(
				`${BASE_SQL_USER_SELECT}
				WHERE user_id = :userId`,
			)
			.get({userId}) as SqlUserRow | undefined;

		return this._fromRow(result);
	}

	private static _fromRow(row: SqlUserRow): User;
	private static _fromRow(row: SqlUserRow | undefined): User | undefined;
	private static _fromRow(row: SqlUserRow | undefined) {
		if (!row) {
			return;
		}

		return new this.User(
			row.user_id,
			row.username,
			row.displayname,
			row.role,
			row.require_pw_change,
			new Date(row.created_at),
			new Date(row.updated_at),
			privateConstructorKey,
		);
	}

	static all(): readonly User[] {
		const result = this.database
			.prepare(
				`${BASE_SQL_USER_SELECT}
				ORDER BY user_id ASC`,
			)
			.all() as SqlUserRow[];

		return result.map(row => this._fromRow(row));
	}

	private static _count() {
		const userCount = this.database
			.prepare(
				`SELECT count(user_id) as count
				FROM users`,
			)
			.get() as {
			count: number;
		};

		return userCount.count;
	}

	static paginate({
		limit,
		page,
	}: {
		readonly limit: number;
		readonly page: number;
	}): PaginationResult<User> {
		const userCount = this._count();

		const lastPage = Math.ceil(userCount / limit);
		const skip = (page - 1) * limit;

		if (userCount < skip) {
			return new PaginationResult({
				lastPage,
				perPageLimit: limit,
				page,
				items: [],
			});
		}

		const recipes = this.database
			.prepare(
				`${BASE_SQL_USER_SELECT}
				ORDER BY user_id ASC
				LIMIT :limit OFFSET :skip`,
			)
			.all({
				limit,
				skip,
			}) as SqlUserRow[];

		const items = recipes.map(row => this._fromRow(row));

		return new PaginationResult({
			lastPage,
			perPageLimit: limit,
			page,
			items,
		});
	}

	permissionToCreateUser(): boolean {
		// Basically invite-only, ask an admin for an account
		return this.role >= UserRoles.Admin;
	}

	permissionToModifyOrDeleteUser(other: User): boolean {
		// Can modify self
		// Admin can modify lower than admins
		// Owner can do anything

		if (other.userId === this.userId) {
			return true;
		}

		if (this.role === UserRoles.Owner) {
			return true;
		}

		if (this.role === UserRoles.Admin && other.role < UserRoles.Admin) {
			return true;
		}

		return false;
	}

	permissionToChangeRole(other: User): boolean {
		// Doesn't matter who other person is
		// Only owner
		void other;
		return this.role === UserRoles.Owner;
	}

	private _triggerUpdated() {
		this._updatedAt = new Date();
		this.database
			.prepare(
				`UPDATE users
					SET updated_at = :updatedAt
					WHERE user_id = :userId`,
			)
			.run({
				updatedAt: this._updatedAt.getTime(),
				userId: this.userId,
			});
	}

	confirmPassword(password: string) {
		const hash = this.database
			.prepare(
				`SELECT password FROM users
					WHERE user_id = :userId`,
			)
			.get({userId: this.userId}) as {password: string} | undefined;

		if (!hash) {
			throw new ApiError('Internal error! Try refreshing the page.');
		}

		const oldPasswordMatches = bcrypt.compareSync(password, hash.password);

		if (!oldPasswordMatches) {
			throw new ApiError('Incorrect current password.');
		}
	}

	changePassword(oldPassword: string, newPassword: string) {
		this.confirmPassword(oldPassword);

		const newHash = bcrypt.hashSync(newPassword, HASH_ROUNDS);
		this.database
			.prepare(
				`UPDATE users
					SET
						password = :newHash,
						require_pw_change = 0
					WHERE user_id = :userId`,
			)
			.run({
				newHash,
				userId: this.userId,
			});

		this._requirePasswordChange = false;

		this._triggerUpdated();
	}

	resetPassword(newPassword: string) {
		const newHash = bcrypt.hashSync(newPassword, HASH_ROUNDS);

		this.database
			.prepare(
				`UPDATE users
				SET
					password = :newHash,
					require_pw_change = 0
				WHERE user_id = :userId`,
			)
			.run({
				newHash: newHash,
				userId: this.userId,
			});

		this._requirePasswordChange = false;

		this._triggerUpdated();
	}

	listRecipes(): Promise<readonly Recipe[]> {
		return this.Recipe.all(this.userId);
	}

	paginateRecipes({
		limit,
		page,
	}: {
		readonly limit: number;
		readonly page: number;
	}): Promise<PaginationResult<Recipe>> {
		return this.Recipe.paginate({limit, page, _userId: this.userId});
	}

	changeUsername(newUsername: string) {
		if (newUsername === this.username) {
			return;
		}

		this.database
			.prepare(
				`UPDATE users
					SET username = :newUsername
					WHERE user_id = :userId`,
			)
			.run({
				newUsername,
				userId: this.userId,
			});

		this._triggerUpdated();

		this._username = newUsername;
	}

	changeDisplayName(newDisplayName: string) {
		if (newDisplayName === this.displayName) {
			return;
		}

		this.database
			.prepare(
				`UPDATE users
					SET displayname = :displayName
					WHERE user_id = :userId`,
			)
			.run({
				displayName: newDisplayName,
				userId: this.userId,
			});

		this._triggerUpdated();
		this._displayName = newDisplayName;
	}

	changeRole(newRole: UserRoles) {
		if (newRole === this.role) {
			return;
		}

		this.database
			.prepare(
				`UPDATE users
					SET role = :newRole
					WHERE user_id = :userId`,
			)
			.run({
				newRole,
				userId: this.userId,
			});

		this._triggerUpdated();
		this._role = newRole;
	}

	updateRequirePasswordChange(requirePasswordChange: boolean) {
		this.database
			.prepare(
				`UPDATE users
				SET require_pw_change = :requirePasswordChange
				WHERE user_id = :userId`,
			)
			.run({
				requirePasswordChange: requirePasswordChange ? 1 : 0,
				userId: this.userId,
			});

		this._requirePasswordChange = requirePasswordChange;
		// Don't update `updatedAt`
		// It is not really a user facing field in the same way
		// that username or so are
	}

	async deleteUser(deleteRecipes: UserDeletion) {
		const recipes = await this.listRecipes();
		if (deleteRecipes === UserDeletion.DeleteRecipes) {
			for (const recipe of recipes) {
				await recipe.delete();
			}
		} else {
			for (const recipe of recipes) {
				recipe.dissociateOwner();
			}
		}

		this.database
			.prepare(
				`DELETE FROM users
					WHERE user_id = :userId`,
			)
			.run({
				userId: this.userId,
			});
	}
}
