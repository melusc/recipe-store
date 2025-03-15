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

import {sectionToText} from 'cooklang';

import type {Recipe} from './recipe.js';

type Qualifier = 'any' | 'tagged' | 'author' | 'contains' | 'title';

export type QueryFilter = {
	readonly qualifier: Qualifier;
	readonly filterValue: string;
};

const qualifiers: Record<string, Qualifier> = {
	tagged: 'tagged',
	tag: 'tagged',
	title: 'title',
	titled: 'title',
	intitle: 'title',
	author: 'author',
	user: 'author',
	by: 'author',
	contains: 'contains',
	intext: 'contains',
};

/*
 * - "Qualifier" is the type of filter `tagged`, `author`, etc
 * - No backslashes or so for escaping quotes
 * - Unmatched quotes are okay.
 *   It just means it will treat the rest of the string as part of that value
 * - A filter can be quoted "tagged:abc" or just the filter-value tagged:"abc"
 * - qualifier and filters can be seperated by whitespace
 */

export class QueryParser {
	index = 0;

	constructor(public readonly query: string) {}

	hasChar() {
		return this.index < this.query.length;
	}

	peek() {
		return this.query[this.index] ?? '';
	}

	readChar() {
		if (this.index >= this.query.length) {
			throw new TypeError('Tried to read character out of bounds.');
		}

		const character = this.query[this.index]!;
		this.next();
		return character;
	}

	next() {
		++this.index;
	}

	skipWS() {
		while (this.hasChar() && /\s/.test(this.peek())) {
			this.next();
		}
	}

	readUntil(stopCondition: string | RegExp) {
		const shouldStop =
			typeof stopCondition === 'string'
				? (char: string) => char === stopCondition
				: (char: string) => stopCondition.test(char);

		let result = '';
		while (this.hasChar() && !shouldStop(this.peek())) {
			result += this.readChar();
		}

		return result;
	}

	readQualifierFilter() {
		this.skipWS();

		if (this.peek() === '"' || this.peek() === "'") {
			const stop = this.readChar();
			const result = this.readUntil(stop);
			this.next();
			return result;
		}

		return this.readUntil(/[\s"']/);
	}

	readQuotedValue(): QueryFilter {
		const stop = this.readChar();
		const filter = this.readUntil(stop);
		this.next();

		if (filter.includes(':')) {
			const [left, ...search] = filter.split(':');
			const qualifier = qualifiers[left!.toLowerCase()] ?? 'any';
			return {
				qualifier,
				filterValue: search.join(':'),
			};
		}
		return {
			qualifier: 'any',
			filterValue: filter,
		};
	}

	parse() {
		this.index = 0;

		const filters: QueryFilter[] = [];

		while ((this.skipWS(), this.hasChar())) {
			if (this.peek() === '"' || this.peek() === "'") {
				filters.push(this.readQuotedValue());

				continue;
			}

			const part = this.readUntil(/[:"'\s]/);

			if (this.peek() === ':') {
				this.next();
				const filter = this.readQualifierFilter();

				const qualifier = qualifiers[part.toLowerCase()] ?? 'any';
				filters.push({
					qualifier,
					filterValue: filter,
				});
			} else {
				filters.push({
					qualifier: 'any',
					filterValue: part,
				});
			}
		}

		return filters;
	}
}

function normaliseSearchValue(value: string) {
	// Treat all whitespace equal by normalising it to a space
	// "abc\r\ndef" == "abc\tdef"
	// Ignore punctuation: "Firstly, add" == "firstly add"
	// Don't care about case
	return value.toLowerCase().replaceAll(/[\s,.:;\-!?]+/g, ' ');
}

function searchContains(needle: string, haystack: string) {
	needle = normaliseSearchValue(needle);
	haystack = normaliseSearchValue(haystack);

	return haystack.includes(needle);
}

const filterMatchers = {
	any(this, filterValue: string, recipe: InstanceType<Recipe>) {
		// `contains:` last because it is probably the slowest, because it has to stringify the sections
		return (
			this.title(filterValue, recipe) ||
			this.tagged(filterValue, recipe) ||
			this.author(filterValue, recipe) ||
			this.contains(filterValue, recipe)
		);
	},
	title(filterValue: string, recipe: InstanceType<Recipe>) {
		return searchContains(filterValue, recipe.title);
	},
	tagged(filterValue: string, recipe: InstanceType<Recipe>) {
		return recipe.tags.some(tag => searchContains(filterValue, tag));
	},
	author(filterValue: string, recipe: InstanceType<Recipe>) {
		if (!recipe.author) {
			return false;
		}

		// author:32
		const asUserId = Number.parseInt(filterValue);
		if (asUserId === recipe.author.userId) {
			return true;
		}

		return (
			// author:Michael Caine
			searchContains(filterValue, recipe.author.displayName) ||
			// author:michaelcaine33
			searchContains(filterValue, recipe.author.username)
		);
	},
	contains(filterValue: string, recipe: InstanceType<Recipe>) {
		// contains:"add to bowl"
		for (const section of recipe.sections) {
			const stringified = sectionToText(section.parsed);
			if (searchContains(filterValue, stringified)) {
				return true;
			}
		}

		return false;
	},
} as const;

export function recipeMatchesFilter(
	recipe: InstanceType<Recipe>,
	filters: readonly QueryFilter[],
) {
	return filters.every(filter =>
		filterMatchers[filter.qualifier](filter.filterValue, recipe),
	);
}
