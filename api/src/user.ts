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

import {randomBytes} from 'node:crypto';

import bcrypt from 'bcrypt';

import {ForbiddenError, LoggedOutError} from './error.js';

import type {ApiOptions} from './index.js';

// Use integers to indicate hierarchy
// Allows comparison of level using lt and gt operator
// Allow for theoretical future roles with fewer permissions
// than admin but more than user, though unlikely
export enum UserRoles {
	LoggedOut = 0,
	User = 1,
	Admin = 9,
	Owner = 10,
}

const HASH_ROUNDS = 11;

export type User = ReturnType<typeof createUserClass>;

export function createUserClass(options: ApiOptions) {
	const {database} = options;

	return class User {
		// Internally r/w, externally readonly
		#username: string;
		#role: UserRoles;

		private constructor(
			readonly userid: string,
			username: string,
			role: UserRoles,
		) {
			this.#username = username;
			this.#role = role;
		}

		get username() {
			return this.#username;
		}

		get role() {
			return this.#role;
		}

		static create(username: string, password: string, role: UserRoles) {
			if (this.fromUsername(username)) {
				throw new ForbiddenError('User already exists. Use another username.');
			}

			const passwordHash = bcrypt.hashSync(password, HASH_ROUNDS);
			const userid = randomBytes(32).toString('base64url');

			database
				.prepare(
					`INSERT INTO users (userid, username, password, role)
						VALUES (:userid, :username, :passwordHash, :role)`,
				)
				.run({
					userid,
					username,
					passwordHash,
					role,
				});

			return new User(userid, username, role);
		}

		static fromUsername(username: string): User | undefined {
			const result = database
				.prepare('SELECT userid, role FROM users WHERE username = ?')
				.get(username) as {userid: string; role: UserRoles} | undefined;

			if (!result) {
				return;
			}

			return new User(result.userid, username, result.role);
		}

		static fromUserid(userid: string): User | undefined {
			const result = database
				.prepare('SELECT username, role FROM users WHERE userid = ?')
				.get(userid) as {username: string; role: UserRoles} | undefined;

			if (!result) {
				return;
			}

			return new User(userid, result.username, result.role);
		}

		permissionToCreateUser(): boolean {
			// Basically invite-only, ask an admin for an account
			return this.role >= UserRoles.Admin;
		}

		permissionToModifyOrDeleteUser(other: User): boolean {
			// Can modify self
			// Admin can modify lower than admins
			// Owner can do anything

			if (other.userid === this.userid) {
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

		changePassword(oldPassword: string, newPassword: string) {
			const oldHash = database
				.prepare('SELECT password FROM users WHERE userid = :userid')
				.get({userid: this.userid}) as {password: string} | undefined;

			if (!oldHash) {
				throw new LoggedOutError();
			}

			const oldPasswordMatches = bcrypt.compareSync(
				oldPassword,
				oldHash.password,
			);

			if (!oldPasswordMatches) {
				throw new ForbiddenError('Incorrect password.');
			}

			const newHash = bcrypt.hashSync(newPassword, HASH_ROUNDS);
			database
				.prepare('UPDATE users SET password = :newHash WHERE userid = :userid')
				.run({
					newHash,
					userid: this.userid,
				});
		}

		resetPassword(newPassword: string) {
			const newHash = bcrypt.hashSync(newPassword, HASH_ROUNDS);

			database
				.prepare('UPDATE users SET password = :newHash WHERE userid = :userid')
				.run({
					newHash: newHash,
					userid: this.userid,
				});
		}

		changeUsername(newUsername: string) {
			database
				.prepare(
					'UPDATE users SET username = :newUsername WHERE userid = :userid',
				)
				.run({
					newUsername,
					userid: this.userid,
				});

			this.#username = newUsername;
		}

		changeRole(newRole: UserRoles) {
			database
				.prepare('UPDATE users SET role = :newRole WHERE userid = :userid')
				.run({
					newRole,
					userid: this.userid,
				});

			this.#role = newRole;
		}
	};
}
