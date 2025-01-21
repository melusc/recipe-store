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

import {makeSlug} from '@lusc/util/slug';

import {
	ForbiddenError,
	UserRoles,
	type ApiOptions,
	type User,
} from '../index.js';

export type Tag = ReturnType<typeof createTagClass>;

export function createTagClass(options: ApiOptions) {
	const {database} = options;
	// InstanceType<Tag> only works if constructor is public
	// constructor should still only be used internally
	const privateConstructorKey = Symbol();

	return class Tag {
		#name: string;
		#slug: string;
		#updatedAt: Date;

		constructor(
			readonly tagId: string,
			name: string,
			slug: string,
			readonly createdAt: Date,
			updatedAt: Date,
			constructorKey: symbol,
		) {
			if (constructorKey !== privateConstructorKey) {
				throw new TypeError('Tag.constructor is private.');
			}

			this.#name = name;
			this.#slug = slug;
			this.#updatedAt = updatedAt;
		}

		get name() {
			return this.#name;
		}

		get slug() {
			return this.#slug;
		}

		get updatedAt() {
			return this.#updatedAt;
		}

		static create(name: string): Tag {
			name = name.trim();
			const slug = makeSlug(name, {appendRandomHex: false});
			const preexistingTag = this.fromSlug(slug);

			if (preexistingTag) {
				throw new ForbiddenError(
					`Cannot create tag ${name}. ${preexistingTag.name} already exists.`,
				);
			}

			const createdAt = new Date();
			const tagId = randomBytes(16).toString('base64url');

			database
				.prepare(
					`INSERT INTO tags
				 (tag_id, name, slug, updated_at, created_at)
				 VALUES (:tagId, :name, :slug, :createdAt, :createdAt)
				 RETURNING tag_id
				`,
				)
				.run({
					tagId,
					name,
					slug,
					createdAt: createdAt.getTime(),
				});

			return new Tag(
				tagId,
				name,
				slug,
				createdAt,
				createdAt,
				privateConstructorKey,
			);
		}

		static fromSlug(slug: string): Tag | undefined {
			const result = database
				.prepare(
					'SELECT tag_id, name, created_at, updated_at FROM tags WHERE slug = ?',
				)
				.get(slug) as
				| {
						tag_id: string;
						name: string;
						created_at: number;
						updated_at: number;
				  }
				| undefined;
			if (!result) {
				return;
			}

			return new Tag(
				result.tag_id,
				result.name,
				slug,
				new Date(result.created_at),
				new Date(result.updated_at),
				privateConstructorKey,
			);
		}

		static fromTagId(tagId: string): Tag | undefined {
			const result = database
				.prepare(
					'SELECT slug, name, updated_at, created_at FROM tags WHERE tag_id = ?',
				)
				.get(tagId) as
				| {
						slug: string;
						name: string;
						created_at: number;
						updated_at: number;
				  }
				| undefined;

			if (!result) {
				return;
			}

			return new Tag(
				tagId,
				result.name,
				result.slug,
				new Date(result.created_at),
				new Date(result.updated_at),
				privateConstructorKey,
			);
		}

		static all(): Tag[] {
			const result = database
				.prepare('SELECT tag_id, name, slug, created_at, updated_at FROM tags')
				.all() as Array<{
				tag_id: string;
				name: string;
				slug: string;
				created_at: number;
				updated_at: number;
			}>;

			return result.map(
				({
					tag_id: tagId,
					name,
					slug,
					created_at: createdAt,
					updated_at: updatedAt,
				}) =>
					new Tag(
						tagId,
						name,
						slug,
						new Date(createdAt),
						new Date(updatedAt),
						privateConstructorKey,
					),
			);
		}

		static permissionToCreateTag(user: InstanceType<User>) {
			return user.role >= UserRoles.User;
		}

		static permissionToModifyOrDeleteTag(user: InstanceType<User>) {
			return user.role >= UserRoles.User;
		}

		changeName(newName: string) {
			const slug = makeSlug(newName, {appendRandomHex: false});
			const preexistingTag = Tag.fromSlug(slug);

			if (preexistingTag) {
				throw new ForbiddenError(
					`Cannot rename tag to ${newName}. ${preexistingTag.name} already exists.`,
				);
			}

			this.#updatedAt = new Date();

			database
				.prepare(
					`
					UPDATE tags
					SET
						name = :name,
						slug = :slug,
						updated_at = :updatedAt
					WHERE tag_id = :tagId`,
				)
				.run({
					name: newName,
					slug,
					updatedAt: this.#updatedAt.getTime(),
					tagId: this.tagId,
				});

			this.#name = newName;
			this.#slug = slug;
		}
	};
}
