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

import {
	cooklangSectionSchema,
	parseSection,
	type CooklangSection,
} from 'cooklang';
import {array, object, string} from 'zod';

import type {Image} from './image.js';
import {InjectableApi} from './injectable.js';
import {QueryParser, recipeMatchesFilter} from './search.js';
import {UserRoles, type User} from './user.js';
import {
	DynamicPaginationResult,
	PaginationResult,
	type ReadonlyDate,
} from './utilities.js';

export type RecipeSection = {
	source: string;
	parsed: CooklangSection;
};

type SqlNullRecipeRow = {
	recipe_id: null;
	// ...
};

type SqlRecipeRow =
	| {
			recipe_id: number;
			title: string;
			author: number;
			created_at: number;
			updated_at: number;
			sections: string;
			image: string | null;
			tags: string;
			source: string | null;
			duration: string | null;
	  }
	| SqlNullRecipeRow;

const BASE_SQL_RECIPE_SELECT = `
SELECT recipe_id,
       title,
       author,
       created_at,
       updated_at,
       sections,
       source,
       duration,
       image,
       json_group_array(recipe_tags.tag_name) AS tags
FROM   recipes
       LEFT JOIN recipe_tags using (recipe_id)`;

const privateConstructorKey = Symbol();

export class Recipe extends InjectableApi {
	// These are accessed by getters
	// That makes then readonly externally
	// Internally, they are r/w

	private _title: string;
	private readonly _createdAt: ReadonlyDate;
	private _updatedAt: ReadonlyDate;
	private _image: Image | undefined;
	private _tags: readonly string[];
	private _sections: readonly RecipeSection[];
	private _author: User | undefined;
	private _source: string | undefined;
	private _duration: string | undefined;

	constructor(
		readonly recipeId: number,
		title: string,
		author: User | undefined,
		createdAt: ReadonlyDate,
		updatedAt: ReadonlyDate,
		image: Image | undefined,
		source: string | undefined,
		duration: string | undefined,
		tags: readonly string[],
		sections: readonly RecipeSection[],
		constructorKey: symbol,
	) {
		if (constructorKey !== privateConstructorKey) {
			throw new TypeError('Recipe.constructor is private.');
		}

		super();

		this._title = title;
		this._author = author;
		this._createdAt = createdAt;
		this._updatedAt = updatedAt;
		this._image = image;
		this._source = source;
		this._duration = duration;
		this._tags = tags;
		this._sections = sections;
	}

	get title() {
		return this._title;
	}

	get author() {
		return this._author;
	}

	get createdAt(): ReadonlyDate {
		return new Date(this._createdAt as Date);
	}

	get updatedAt(): ReadonlyDate {
		return new Date(this._updatedAt as Date);
	}

	get image() {
		return this._image;
	}

	get source() {
		return this._source;
	}

	get duration() {
		return this._duration;
	}

	get tags() {
		return this._tags;
	}

	get sections() {
		return this._sections;
	}

	private _triggerUpdated() {
		this._updatedAt = new Date();
		this.database
			.prepare(
				`UPDATE recipes
				SET updated_at = :updatedAt
				WHERE recipe_id = :recipeId`,
			)
			.run({
				updatedAt: this._updatedAt.getTime(),
				recipeId: this.recipeId,
			});
	}

	static async create(
		title: string,
		author: User,
		image: Image | undefined,
		source: string | undefined,
		duration: string | undefined,
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

		const {recipe_id: recipeId} = this.database
			.prepare(
				`INSERT INTO recipes
				(title, author, created_at, updated_at, sections, image, source, duration)
				VALUES (
					:title, :author, :createdAt, :createdAt,
					:sections, :imagePath, :source, :duration
				)
				RETURNING recipe_id`,
			)
			.get({
				title,
				author: author.userId,
				createdAt: createdAt.getTime(),
				sections: JSON.stringify(sectionsParsed),
				imagePath: null,
				source: source ?? null,
				duration: duration ?? null,
			}) as {recipe_id: number};

		const recipe = new this.Recipe(
			recipeId,
			title,
			author,
			createdAt,
			createdAt,
			undefined,
			source,
			duration,
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

	// UserId is internal use only
	// Avoid duplication in User#listRecipes
	static all(_userId?: number): Promise<readonly Recipe[]> {
		const query = [BASE_SQL_RECIPE_SELECT];
		const parameters: Record<string, number> = {};

		if (_userId !== undefined) {
			query.push('WHERE author = :userId');
			parameters['userId'] = _userId;
		}

		query.push('GROUP BY recipe_id', 'ORDER BY recipe_id ASC');

		const recipes = this.database
			.prepare(query.join(' '))
			.all(parameters) as ReadonlyArray<SqlRecipeRow>;

		return Promise.all(recipes.map(row => this._fromRow(row)));
	}

	// Internal parameters `userId` is for use via `User#paginateRecipes`
	// Adding this optional parameter allows for deduplication instead
	// of one method here and one there
	private static _count(userId?: number) {
		let query = `SELECT count(recipe_id) as count
				FROM recipes`;

		const parameters: Record<string, number> = {};

		if (userId !== undefined) {
			query += ' WHERE author = :userId';
			parameters['userId'] = userId;
		}

		const recipeCount = this.database.prepare(query).get(parameters) as {
			count: number;
		};

		return recipeCount.count;
	}

	static async search({
		limit,
		page,
		query,
	}: {
		limit: number;
		page: number;
		query: string;
	}): Promise<DynamicPaginationResult<Recipe>> {
		let hasSkipped = 0;
		const shouldSkip = (page - 1) * limit;

		// Short-circuit if it is asking for a page that
		// certainly cannot exist because there are too few recipes
		if (shouldSkip >= this._count()) {
			return new DynamicPaginationResult({
				page,
				items: [],
				hasNextPage: false,
				perPageLimit: limit,
			});
		}

		const items: Recipe[] = [];
		const queryFilters = new QueryParser(query).parse();

		const statement = this.database.prepare(
			`${BASE_SQL_RECIPE_SELECT}
			GROUP BY recipe_id
			ORDER BY recipe_id ASC`,
		);
		const rowIterator = statement.iterate() as NodeJS.Iterator<SqlRecipeRow>;

		for (const row of rowIterator) {
			const recipe = await this._fromRow(row);
			if (recipeMatchesFilter(recipe, queryFilters)) {
				if (hasSkipped === shouldSkip) {
					items.push(recipe);
				} else {
					++hasSkipped;
				}
			}

			if (items.length === limit + 1) {
				return new DynamicPaginationResult({
					page,
					items: items.slice(0, -1),
					hasNextPage: true,
					perPageLimit: limit,
				});
			}
		}

		if (items.length <= limit && items.length > 0) {
			return new DynamicPaginationResult({
				page,
				items,
				hasNextPage: false,
				lastPage: page,
				perPageLimit: limit,
			});
		}

		const lastPage = Math.ceil(hasSkipped / limit);
		return new DynamicPaginationResult({
			page,
			items: [],
			hasNextPage: false,
			lastPage,
			perPageLimit: limit,
		});
	}

	static async paginate({
		limit,
		page,
		_userId: userId,
	}: {
		readonly limit: number;
		readonly page: number;
		readonly _userId?: number;
	}): Promise<PaginationResult<Recipe>> {
		const recipeCount = this._count(userId);

		const lastPage = Math.ceil(recipeCount / limit);
		const skip = (page - 1) * limit;

		if (recipeCount < skip) {
			return new PaginationResult({
				lastPage,
				perPageLimit: limit,
				page,
				items: [],
			});
		}

		const parameters: Record<string, number> = {
			limit,
			skip,
		};
		const query = [BASE_SQL_RECIPE_SELECT];

		if (userId !== undefined) {
			parameters['userId'] = userId;
			query.push('WHERE author = :userId');
		}

		query.push(
			'GROUP BY recipe_id',
			'ORDER BY recipe_id ASC',
			'LIMIT :limit OFFSET :skip',
		);

		const recipes = this.database
			.prepare(query.join(' '))
			.all(parameters) as ReadonlyArray<SqlRecipeRow>;

		const items = recipes.map(row => this.Recipe._fromRow(row));

		return new PaginationResult({
			lastPage,
			perPageLimit: limit,
			page,
			items: await Promise.all(items),
		});
	}

	private static async _fromRow(row: SqlRecipeRow): Promise<Recipe>;
	private static async _fromRow(
		row: SqlRecipeRow | undefined,
	): Promise<Recipe | undefined>;
	private static async _fromRow(row: SqlRecipeRow | undefined) {
		// LEFT JOIN with aggr func means
		// it returns a row but all columns are null
		if (!row || row.recipe_id === null) {
			return;
		}

		const parsedSections = array(
			object({
				source: string(),
				parsed: cooklangSectionSchema,
			}).readonly(),
		)
			.readonly()
			.parse(JSON.parse(row.sections));

		// Left join means right (=recipe_tags) can be null
		// I.e. if a recipe has no tags it returns [null]
		const tags = (JSON.parse(row.tags) as Array<string | null>).filter(
			tag => tag !== null,
		);

		const image = row.image ? await this.Image.fromName(row.image) : undefined;

		return new this.Recipe(
			row.recipe_id,
			row.title,
			row.author === -1 ? undefined : this.User.fromUserid(row.author),
			new Date(row.created_at),
			new Date(row.updated_at),
			image,
			row.source ?? undefined,
			row.duration ?? undefined,
			tags,
			parsedSections,
			privateConstructorKey,
		);
	}

	static fromRecipeId(recipeId: number) {
		const result = this.database
			.prepare(
				`${BASE_SQL_RECIPE_SELECT}
				WHERE recipe_id = :recipeId`,
			)
			.get({recipeId}) as SqlRecipeRow | undefined;

		return this._fromRow(result);
	}

	addTag(tag: string) {
		const result = this.database
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
			this._triggerUpdated();
			this._syncTags();
		}
	}

	removeTag(tag: string) {
		const result = this.database
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
			this._triggerUpdated();
			this._syncTags();
		}
	}

	clearTags() {
		const result = this.database
			.prepare(
				`DELETE FROM recipe_tags
				WHERE recipe_id = :recipeId`,
			)
			.run({recipeId: this.recipeId});

		if (result.changes > 0) {
			this._triggerUpdated();
		}

		this._tags = [];
	}

	// A tag will be deleted IFF `makeSlug(a) === makeSlug(b)`
	// that means it is possible `a !== b`
	// For simplicity just requery the tags
	private _syncTags() {
		const tags = this.database
			.prepare(
				`SELECT tag_name FROM recipe_tags
				WHERE recipe_id = :recipeId
				ORDER BY tag_slug ASC`,
			)
			.all({recipeId: this.recipeId}) as ReadonlyArray<{
			tag_name: string;
		}>;

		this._tags = tags.map(({tag_name: tagName}) => tagName);
	}

	async updateImage(image: Image | undefined) {
		if (image?.name === this.image?.name) {
			return;
		}

		if (image?.isTemporary()) {
			image = await image.makePermament();
		}

		// Update database first to prevent
		// race condition where image doesn't exist anymore
		// but database points to it still
		this.database
			.prepare(
				`UPDATE recipes
				SET image = :image
				WHERE recipe_id = :recipeId`,
			)
			.run({
				recipeId: this.recipeId,
				image: image?.name ?? null,
			});

		await this._image?.rm();
		this._image = image;

		this._triggerUpdated();
	}

	updateSections(sections: readonly string[]) {
		if (
			sections.length === this.sections.length &&
			sections.every(
				(section, index) => this.sections[index]!.source === section,
			)
		) {
			return;
		}

		const sectionsParsed = sections.map(
			source =>
				({
					source,
					parsed: parseSection(source),
				}) satisfies RecipeSection,
		);

		this.database
			.prepare(
				`UPDATE recipes
				SET sections = :sections
				WHERE recipe_id = :recipeId`,
			)
			.run({
				recipeId: this.recipeId,
				sections: JSON.stringify(sectionsParsed),
			});

		this._sections = sectionsParsed;

		this._triggerUpdated();
	}

	updateTitle(newTitle: string) {
		if (newTitle === this.title) {
			return;
		}

		this.database
			.prepare(
				`UPDATE recipes
				SET title = :title
				WHERE recipe_id = :recipeId`,
			)
			.run({
				recipeId: this.recipeId,
				title: newTitle,
			});

		this._title = newTitle;

		this._triggerUpdated();
	}

	updateSource(newSource: string | undefined) {
		if (newSource === this.source) {
			return;
		}

		this.database
			.prepare(
				`UPDATE recipes
				SET source = :source
				WHERE recipe_id = :recipeId`,
			)
			.run({
				recipeId: this.recipeId,
				source: newSource ?? null,
			});

		this._source = newSource;

		this._triggerUpdated();
	}

	updateDuration(newDuration: string | undefined) {
		if (newDuration === this.duration) {
			return;
		}

		this.database
			.prepare(
				`UPDATE recipes
				SET duration = :duration
				WHERE recipe_id = :recipeId`,
			)
			.run({
				recipeId: this.recipeId,
				duration: newDuration ?? null,
			});

		this._duration = newDuration;

		this._triggerUpdated();
	}

	async delete() {
		await this._image?.rm();
		this._image = undefined;

		this.database
			.prepare(
				`DELETE FROM recipes
				WHERE recipe_id = :recipeId`,
			)
			.run({
				recipeId: this.recipeId,
			});
	}

	dissociateOwner() {
		this.database
			.prepare(
				`UPDATE recipes
				SET author = -1
				WHERE recipe_id = :recipeId`,
			)
			.run({
				recipeId: this.recipeId,
			});

		this._author = undefined;
		this._triggerUpdated();
	}

	static permissionToCreateRecipe(other: User) {
		return other.role >= UserRoles.User;
	}

	permissionToModifyRecipe(other: User) {
		if (other.userId === this.author?.userId) {
			return true;
		}

		return other.role >= UserRoles.Admin;
	}
}
