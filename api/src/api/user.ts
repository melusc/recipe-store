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

import bcrypt from 'bcrypt';

import {ApiError} from './error.js';
import type {Recipe} from './recipe.js';
import type {ReadonlyDate} from './util.js';

import type {InternalApiOptions} from './index.js';

// Use integers to indicate hierarchy
// Allows comparison of level using lt and gt operator
// Allow for theoretical future roles with fewer permissions
// than admin but more than user, though unlikely
export enum UserRoles {
	User = 0,
	Admin = 4,
	Owner = 5,
}

const HASH_ROUNDS = 10;

export type User = ReturnType<typeof createUserClass>;

export function createUserClass(options: InternalApiOptions) {
	const {database} = options;
	// InstanceType<Tag> only works if constructor is public
	// constructor should still only be used internally
	const privateConstructorKey = Symbol();

	return class User {
		// Internally r/w, externally readonly
		#username: string;
		#role: UserRoles;
		#updatedAt: ReadonlyDate;

		readonly #createdAt: ReadonlyDate;

		constructor(
			readonly userId: number,
			username: string,
			role: UserRoles,
			createdAt: ReadonlyDate,
			updatedAt: ReadonlyDate,
			constructorKey: symbol,
		) {
			if (constructorKey !== privateConstructorKey) {
				throw new TypeError('User.constructor is private.');
			}

			this.#username = username;
			this.#role = role;
			this.#createdAt = createdAt;
			this.#updatedAt = updatedAt;
		}

		get username() {
			return this.#username;
		}

		get role() {
			return this.#role;
		}

		get updatedAt(): ReadonlyDate {
			return new Date(this.#updatedAt as Date);
		}

		get createdAt(): ReadonlyDate {
			return new Date(this.#createdAt as Date);
		}

		static create(username: string, password: string, role: UserRoles) {
			if (this.fromUsername(username)) {
				throw new ApiError('User already exists. Use another username.');
			}

			const passwordHash = bcrypt.hashSync(password, HASH_ROUNDS);
			const createdAt = new Date();

			const {user_id: userId} = database
				.prepare(
					`INSERT INTO users (username, password, role, created_at, updated_at)
					 VALUES (:username, :passwordHash, :role, :createdAt, :createdAt)
					 RETURNING user_id`,
				)
				.get({
					username,
					passwordHash,
					role,
					createdAt: createdAt.getTime(),
				}) as {user_id: number};

			return new User(
				userId,
				username,
				role,
				createdAt,
				createdAt,
				privateConstructorKey,
			);
		}

		static login(username: string, password: string): User {
			const result = database
				.prepare(
					`SELECT user_id, role, password, created_at, updated_at FROM users
					WHERE username = ?`,
				)
				.get(username) as
				| {
						user_id: number;
						role: UserRoles;
						password: string;
						created_at: number;
						updated_at: number;
				  }
				| undefined;

			const passwordMatch =
				!!result && bcrypt.compareSync(password, result.password);
			if (!passwordMatch) {
				throw new ApiError('Invalid credentials. Please try again.');
			}

			return new User(
				result.user_id,
				username,
				result.role,
				new Date(result.created_at),
				new Date(result.updated_at),
				privateConstructorKey,
			);
		}

		static fromUsername(username: string): User | undefined {
			const result = database
				.prepare(
					`SELECT user_id, role, updated_at, created_at
					FROM users WHERE username = ?`,
				)
				.get(username) as
				| {
						user_id: number;
						role: UserRoles;
						updated_at: number;
						created_at: number;
				  }
				| undefined;

			if (!result) {
				return;
			}

			return new User(
				result.user_id,
				username,
				result.role,
				new Date(result.created_at),
				new Date(result.updated_at),
				privateConstructorKey,
			);
		}

		static fromUserid(userId: number): User | undefined {
			const result = database
				.prepare(
					`SELECT username, role, updated_at, created_at FROM users
					WHERE user_id = ?`,
				)
				.get(userId) as
				| {
						username: string;
						role: UserRoles;
						updated_at: number;
						created_at: number;
				  }
				| undefined;

			if (!result) {
				return;
			}

			return new User(
				userId,
				result.username,
				result.role,
				new Date(result.created_at),
				new Date(result.updated_at),
				privateConstructorKey,
			);
		}

		static all(): readonly User[] {
			const result = database
				.prepare(
					`SELECT username, role, user_id, created_at, updated_at
					FROM users`,
				)
				.all() as Array<{
				username: string;
				role: UserRoles;
				user_id: number;
				created_at: number;
				updated_at: number;
			}>;

			return result.map(
				({
					username,
					role,
					user_id: userId,
					created_at: createdAt,
					updated_at: updatedAt,
				}) =>
					new User(
						userId,
						username,
						role,
						new Date(createdAt),
						new Date(updatedAt),
						privateConstructorKey,
					),
			);
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

		#triggerUpdated() {
			this.#updatedAt = new Date();
			database
				.prepare(
					`UPDATE users
					SET updated_at = :updatedAt
					WHERE user_id = :userId`,
				)
				.run({
					updatedAt: this.#updatedAt.getTime(),
					userId: this.userId,
				});
		}

		changePassword(oldPassword: string, newPassword: string) {
			const oldHash = database
				.prepare(
					`SELECT password FROM users
					WHERE user_id = :userId`,
				)
				.get({userId: this.userId}) as {password: string} | undefined;

			if (!oldHash) {
				throw new ApiError('Internal error! Try refreshing the page.');
			}

			const oldPasswordMatches = bcrypt.compareSync(
				oldPassword,
				oldHash.password,
			);

			if (!oldPasswordMatches) {
				throw new ApiError('Incorrect password.');
			}

			const newHash = bcrypt.hashSync(newPassword, HASH_ROUNDS);
			database
				.prepare(
					`UPDATE users
					SET password = :newHash
					WHERE user_id = :userId`,
				)
				.run({
					newHash,
					userId: this.userId,
				});

			this.#triggerUpdated();
		}

		resetPassword(newPassword: string) {
			const newHash = bcrypt.hashSync(newPassword, HASH_ROUNDS);

			database
				.prepare(
					`UPDATE users
					SET password = :newHash
					WHERE user_id = :userId`,
				)
				.run({
					newHash: newHash,
					userId: this.userId,
				});

			this.#triggerUpdated();
		}

		listRecipes(): ReadonlyArray<InstanceType<Recipe>> {
			const recipeIds = database
				.prepare(
					`SELECT recipe_id FROM recipes
					WHERE author = :userId`,
				)
				.all({
					userId: this.userId,
				}) as Array<{recipe_id: number}>;

			return recipeIds.map(
				({recipe_id: recipeId}) => options.Recipe.fromRecipeId(recipeId)!,
			);
		}

		changeUsername(newUsername: string) {
			database
				.prepare(
					`UPDATE users
					SET username = :newUsername
					WHERE user_id = :userId`,
				)
				.run({
					newUsername,
					userId: this.userId,
				});

			this.#triggerUpdated();

			this.#username = newUsername;
		}

		changeRole(newRole: UserRoles) {
			database
				.prepare(
					`UPDATE users
					SET role = :newRole
					WHERE user_id = :userId`,
				)
				.run({
					newRole,
					userId: this.userId,
				});

			this.#triggerUpdated();
			this.#role = newRole;
		}

		async deleteUser(deleteRecipes: boolean) {
			if (deleteRecipes) {
				for (const recipe of this.listRecipes()) {
					await recipe.delete();
				}
			} else {
				for (const recipe of this.listRecipes()) {
					recipe.dissociateOwner();
				}
			}

			database
				.prepare(
					`DELETE FROM users
					WHERE user_id = :userId`,
				)
				.run({
					userId: this.userId,
				});
		}
	};
}
