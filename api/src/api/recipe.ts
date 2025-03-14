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

import type {Buffer} from 'node:buffer';
import {randomBytes} from 'node:crypto';
import {unlink, writeFile} from 'node:fs/promises';

import {
	cooklangSectionSchema,
	parseSection,
	type CooklangSection,
} from 'cooklang';
import {fileTypeFromBuffer} from 'file-type';
import {array, object, string} from 'zod';

import {PaginationResult, type ReadonlyDate} from './utilities.js';

import {
	ApiError,
	UserRoles,
	type InternalApiOptions,
	type User,
} from './index.js';

export type RecipeSection = {
	source: string;
	parsed: CooklangSection;
};

const allowedImageMimes: ReadonlySet<string> = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
]);
async function validateImageType(image: Buffer): Promise<string> {
	if (image.byteLength > 10e6) {
		throw new ApiError('Image is too large. Maximum of 10 MB is allowed.');
	}

	const fileType = await fileTypeFromBuffer(image);
	if (fileType && allowedImageMimes.has(fileType.mime)) {
		return fileType.ext;
	}

	throw new ApiError(
		'Unknown image type. Allowed image types are JPG, PNG, and WEBP.',
	);
}

function randomImageName(extension: string) {
	const name = randomBytes(30).toString('base64url');
	return `${name}.${extension}`;
}

export type Recipe = ReturnType<typeof createRecipeClass>;
export function createRecipeClass(options: InternalApiOptions) {
	const {database} = options;
	// InstanceType<Tag> only works if constructor is public
	// constructor should still only be used internally
	const privateConstructorKey = Symbol();

	return class Recipe {
		#title: string;
		readonly #createdAt: ReadonlyDate;
		#updatedAt: ReadonlyDate;
		#image: string | undefined;
		#tags: readonly string[];
		#sections: readonly RecipeSection[];
		#author: InstanceType<User> | undefined;

		constructor(
			readonly recipeId: number,
			title: string,
			author: InstanceType<User> | undefined,
			createdAt: ReadonlyDate,
			updatedAt: ReadonlyDate,
			image: string | undefined,
			tags: readonly string[],
			sections: readonly RecipeSection[],
			constructorKey: symbol,
		) {
			if (constructorKey !== privateConstructorKey) {
				throw new TypeError('Recipe.constructor is private.');
			}

			this.#title = title;
			this.#author = author;
			this.#createdAt = createdAt;
			this.#updatedAt = updatedAt;
			this.#image = image;
			this.#tags = tags;
			this.#sections = sections;
		}

		get title() {
			return this.#title;
		}

		get author() {
			return this.#author;
		}

		get createdAt(): ReadonlyDate {
			return new Date(this.#createdAt as Date);
		}

		get updatedAt(): ReadonlyDate {
			return new Date(this.#updatedAt as Date);
		}

		get image() {
			return this.#image;
		}

		get tags() {
			return this.#tags;
		}

		get sections() {
			return this.#sections;
		}

		#triggerUpdated() {
			this.#updatedAt = new Date();
			database
				.prepare(
					`UPDATE recipes
					SET updated_at = :updatedAt
					WHERE recipe_id = :recipeId`,
				)
				.run({
					updatedAt: this.#updatedAt.getTime(),
					recipeId: this.recipeId,
				});
		}

		static async create(
			title: string,
			author: InstanceType<User>,
			image: Buffer | undefined,
			tags: readonly string[],
			sections: readonly string[],
		) {
			const createdAt = new Date();

			const sectionsParsed = sections.map(
				source =>
					({
						source,
						parsed: parseSection(source),
					}) satisfies RecipeSection,
			);

			const {recipe_id: recipeId} = database
				.prepare(
					`INSERT INTO recipes
					(title, author, created_at, updated_at, sections, image)
					VALUES (:title, :author, :createdAt, :createdAt, :sections, :imagePath)
					RETURNING recipe_id`,
				)
				.get({
					title,
					author: author.userId,
					createdAt: createdAt.getTime(),
					sections: JSON.stringify(sectionsParsed),
					imagePath: null,
				}) as {recipe_id: number};

			const recipe = new Recipe(
				recipeId,
				title,
				author,
				createdAt,
				createdAt,
				undefined,
				[],
				sectionsParsed,
				privateConstructorKey,
			);

			// This requires some logic to deduplicate tags
			// It is easier and guarantees correctness
			// to use this method instead
			// Downside is a seperate SQL query for each tag
			for (const tag of tags) {
				recipe.addTag(tag);
			}

			await recipe.updateImage(image);

			return recipe;
		}

		static all(): ReadonlyArray<Recipe> {
			const recipes = database
				.prepare(
					`SELECT recipe_id FROM recipes
					ORDER BY recipe_id ASC`,
				)
				.all() as ReadonlyArray<{recipe_id: number}>;

			return recipes.map(
				({recipe_id: recipeId}) => this.fromRecipeId(recipeId)!,
			);
		}

		static count() {
			const recipeCount = database
				.prepare(
					`SELECT count(recipe_id) as count
					FROM recipes`,
				)
				.get() as {
				count: number;
			};

			return recipeCount.count;
		}

		static paginate({
			limit,
			page,
		}: {
			readonly limit: number;
			readonly page: number;
		}): PaginationResult<Recipe> {
			const recipeCount = this.count();

			const pageCount = Math.ceil(recipeCount / limit);
			const skip = (page - 1) * limit;

			if (recipeCount < skip) {
				return new PaginationResult({pageCount, page, items: []});
			}

			const recipes = database
				.prepare(
					`SELECT recipe_id FROM recipes
					ORDER BY recipe_id ASC
					LIMIT :limit OFFSET :skip`,
				)
				.all({
					limit,
					skip,
				}) as ReadonlyArray<{
				recipe_id: number;
			}>;

			return new PaginationResult({
				pageCount,
				page,
				items: recipes.map(
					({recipe_id: recipeId}) => Recipe.fromRecipeId(recipeId)!,
				),
			});
		}

		static fromRecipeId(recipeId: number) {
			const result = database
				.prepare(
					`SELECT
						title, author, created_at,
						updated_at, sections, image FROM recipes
					WHERE recipe_id = :recipeId`,
				)
				.get({recipeId}) as
				| {
						title: string;
						author: number;
						created_at: number;
						updated_at: number;
						sections: string;
						image: string | null;
				  }
				| undefined;

			if (!result) {
				return;
			}

			const tags = database
				.prepare(
					`SELECT tag_name FROM recipe_tags
					WHERE recipe_id = :recipeId`,
				)
				.all({recipeId}) as ReadonlyArray<{
				tag_name: string;
			}>;

			const parsedSections = array(
				object({
					source: string(),
					parsed: cooklangSectionSchema,
				}).readonly(),
			)
				.readonly()
				.parse(JSON.parse(result.sections));

			return new Recipe(
				recipeId,
				result.title,
				result.author === -1
					? undefined
					: options.User.fromUserid(result.author),
				new Date(result.created_at),
				new Date(result.updated_at),
				result.image ?? undefined,
				tags.map(s => s.tag_name),
				parsedSections,
				privateConstructorKey,
			);
		}

		addTag(tag: string) {
			const result = database
				.prepare(
					`INSERT INTO recipe_tags
					SELECT :recipeId, :tagName
					WHERE NOT EXISTS (
						SELECT 1 FROM recipe_tags
						WHERE recipe_id = :recipeId
							AND tag_slug = sluggify(:tagName)
					)`,
				)
				.run({
					recipeId: this.recipeId,
					tagName: tag,
				});

			if (result.changes > 0) {
				this.#triggerUpdated();
				this.#syncTags();
			}
		}

		removeTag(tag: string) {
			const result = database
				.prepare(
					`DELETE FROM recipe_tags
					WHERE recipe_id = :recipeId
				  AND tag_slug = sluggify(:tagName)`,
				)
				.run({
					recipeId: this.recipeId,
					tagName: tag,
				});

			if (result.changes > 0) {
				this.#triggerUpdated();
				this.#syncTags();
			}
		}

		clearTags() {
			const result = database
				.prepare(
					`DELETE FROM recipe_tags
					WHERE recipe_id = :recipeId`,
				)
				.run({recipeId: this.recipeId});

			if (result.changes > 0) {
				this.#triggerUpdated();
			}

			this.#tags = [];
		}

		// A tag will be deleted IFF `makeSlug(a) === makeSlug(b)`
		// that means it is possible `a !== b`
		// For simplicity just requery the tags
		#syncTags() {
			const tags = database
				.prepare(
					`SELECT tag_name FROM recipe_tags
					WHERE recipe_id = :recipeId
					ORDER BY tag_slug ASC`,
				)
				.all({recipeId: this.recipeId}) as ReadonlyArray<{
				tag_name: string;
			}>;

			this.#tags = tags.map(({tag_name: tagName}) => tagName);
		}

		async updateImage(image: Buffer | undefined) {
			let imagePath: string | undefined;

			if (image) {
				const imageExtension = await validateImageType(image);
				imagePath = randomImageName(imageExtension);
				// eslint-disable-next-line security/detect-non-literal-fs-filename
				await writeFile(new URL(imagePath, options.imageDirectory), image);
			}

			// Update database first to prevent
			// race condition where image doesn't exist anymore
			// but database points to it still
			database
				.prepare(
					`UPDATE recipes
					SET image = :image
					WHERE recipe_id = :recipeId`,
				)
				.run({
					recipeId: this.recipeId,
					image: imagePath ?? null,
				});

			if (this.#image) {
				// eslint-disable-next-line security/detect-non-literal-fs-filename
				await unlink(new URL(this.#image, options.imageDirectory));
			}

			this.#image = imagePath;

			this.#triggerUpdated();
		}

		updateSections(sections: readonly string[]) {
			const sectionsParsed = sections.map(
				source =>
					({
						source,
						parsed: parseSection(source),
					}) satisfies RecipeSection,
			);

			database
				.prepare(
					`UPDATE recipes
					SET sections = :sections
					WHERE recipe_id = :recipeId`,
				)
				.run({
					recipeId: this.recipeId,
					sections: JSON.stringify(sectionsParsed),
				});

			this.#sections = sectionsParsed;

			this.#triggerUpdated();
		}

		updateTitle(newTitle: string) {
			database
				.prepare(
					`UPDATE recipes
					SET title = :title
					WHERE recipe_id = :recipeId`,
				)
				.run({
					recipeId: this.recipeId,
					title: newTitle,
				});

			this.#title = newTitle;

			this.#triggerUpdated();
		}

		async delete() {
			if (this.#image) {
				// eslint-disable-next-line security/detect-non-literal-fs-filename
				await unlink(new URL(this.#image, options.imageDirectory));
				// If `.delete` is called twice
				this.#image = undefined;
			}

			database
				.prepare(
					`DELETE FROM recipes
					WHERE recipe_id = :recipeId`,
				)
				.run({
					recipeId: this.recipeId,
				});
		}

		dissociateOwner() {
			database
				.prepare(
					`UPDATE recipes
					SET author = -1
					WHERE recipe_id = :recipeId`,
				)
				.run({
					recipeId: this.recipeId,
				});

			this.#author = undefined;
			this.#triggerUpdated();
		}

		static permissionToCreateRecipe(other: InstanceType<User>) {
			return other.role >= UserRoles.User;
		}

		permissionToModifyRecipe(other: InstanceType<User>) {
			if (other.userId === this.author?.userId) {
				return true;
			}

			return other.role >= UserRoles.Admin;
		}
	};
}
