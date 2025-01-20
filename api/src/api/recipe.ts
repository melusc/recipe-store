import {fileURLToPath} from 'node:url';

import type {ApiOptions, User} from '../index.js';

export type Recipe = ReturnType<typeof createRecipeClass>;
export function createRecipeClass(options: ApiOptions) {
	const {database} = options;
	// InstanceType<Tag> only works if constructor is public
	// constructor should still only be used internally
	const privateConstructorKey = Symbol();

	void database;

	return class Recipe {
		#title: string;
		#updatedAt: Date;
		#image: URL;

		constructor(
			readonly recipeId: number,
			title: string,
			readonly author: User,
			readonly createdAt: Date,
			updatedAt: Date,
			image: URL,
			constructorKey: symbol,
		) {
			if (constructorKey !== privateConstructorKey) {
				throw new TypeError('Recipe.constructor is private.');
			}

			this.#title = title;
			this.#updatedAt = updatedAt;
			this.#image = image;
		}

		get title() {
			return this.#title;
		}

		get updatedAt() {
			return this.#updatedAt;
		}

		get image() {
			return fileURLToPath(this.#image);
		}
	};
}
