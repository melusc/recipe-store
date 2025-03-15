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

import {describe, expect, test} from 'vitest';

import {
	QueryParser,
	recipeMatchesFilter,
	type QueryFilter,
} from '../src/api/search.js';
import {UserRoles} from '../src/index.js';

import {apiTest} from './utilities.js';

describe('QueryParser', () => {
	test.for<[string, QueryFilter[]]>([
		['abc', [{qualifier: 'any', filterValue: 'abc'}]],
		['tag:abc', [{qualifier: 'tagged', filterValue: 'abc'}]],
		['"contains:abc"', [{qualifier: 'contains', filterValue: 'abc'}]],
		["'by:abc\"'", [{qualifier: 'author', filterValue: 'abc"'}]],
		['author:"abc def"', [{qualifier: 'author', filterValue: 'abc def'}]],
		[
			'abc def',
			[
				{qualifier: 'any', filterValue: 'abc'},
				{qualifier: 'any', filterValue: 'def'},
			],
		],
		["'abc def'", [{qualifier: 'any', filterValue: 'abc def'}]],
		['"abc def"', [{qualifier: 'any', filterValue: 'abc def'}]],
		['"abc', [{qualifier: 'any', filterValue: 'abc'}]],
		['   intext:abc  ', [{qualifier: 'contains', filterValue: 'abc'}]],
		['   user: abc ', [{qualifier: 'author', filterValue: 'abc'}]],
		[
			'tagged:contains:ABC',
			[{qualifier: 'tagged', filterValue: 'contains:ABC'}],
		],
		[
			'tagged:cookie author:Sophia',
			[
				{qualifier: 'tagged', filterValue: 'cookie'},
				{qualifier: 'author', filterValue: 'Sophia'},
			],
		],
		['tagged: "abc"', [{qualifier: 'tagged', filterValue: 'abc'}]],
		[
			'tagged:abc"def"',
			[
				{qualifier: 'tagged', filterValue: 'abc'},
				{qualifier: 'any', filterValue: 'def'},
			],
		],
		['title:coolyo', [{qualifier: 'title', filterValue: 'coolyo'}]],
		['intitle:pie', [{qualifier: 'title', filterValue: 'pie'}]],
		['TitLeD: "soft cake"', [{qualifier: 'title', filterValue: 'soft cake'}]],
		['', []],
		[' ', []],
	])('parse(%j)', ([query, expectedParsed]) => {
		const queryParser = new QueryParser(query);
		const parsed = queryParser.parse();

		expect(parsed).toStrictEqual(expectedParsed);
	});
});

apiTest.for<[query: string, ...expectedRecipeTitles: string[]]>([
	['user:1', 'Banana Cake', 'Mushroom Risotto'],
	['user:1 waiter', 'Mushroom Risotto'],
	['user:2', 'Chocolate Cake'],
	['user:Michael', 'Banana Cake', 'Mushroom Risotto'],
	['user:pickle', 'Chocolate Cake'],
	['tagged:cake', 'Banana Cake', 'Chocolate Cake'],
	['tagged:"chocolate cake"', 'Chocolate Cake'],
	['title:mushroom', 'Mushroom Risotto'],
	['easy', 'Banana Cake'],
	['restaurant', 'Mushroom Risotto'],
	['first prepare', 'Banana Cake'],
	['unique', 'Banana Cake', 'Chocolate Cake'],
	['tagged:unique', 'Banana Cake'],
	['contains:unique', 'Chocolate Cake'],
	['unique banana', 'Banana Cake'],
])(
	'recipeMatchesFilter(%j)',
	async ([query, ...expectedTitles], {api: {User, Recipe}}) => {
		const expectedTitlesSet = new Set(expectedTitles);
		const queryParsed = new QueryParser(query).parse();

		const user1 = User.create(
			'michaelcaine33',
			'Michael Caine',
			'vvnem',
			UserRoles.User,
		);
		const user2 = User.create(
			'picklerick',
			'Rick Sanchez',
			'emaee',
			UserRoles.User,
		);

		const recipes = await Promise.all([
			Recipe.create(
				'Banana Cake',
				user1,
				undefined,
				// "unique" appears only in tags
				['cake', 'banana', 'dessert', 'easy cakes', 'unique'],
				[
					'First, prepare a bowl with @flour{200%g} and @sugar{150%g}. Stir until uniform.',
					'Add @bananas{3} to a seperate bowl and lightly mash.',
					'Combine the two bowls and add @milk{200%mL}.',
				],
			),
			Recipe.create(
				'Chocolate Cake',
				user2,
				undefined,
				// Badly tagged
				['chocolate cake'],
				[
					'Buy @chocolate cake{} from shop.',
					'Put in #fridge{} and let cool down for a few hours.',
					// "unique" appears only in text
					'unique',
				],
			),
			Recipe.create(
				'Mushroom Risotto',
				user1,
				undefined,
				['risotto', 'mushroom'],
				['Go to #restaurant{}.', 'Ask waiter for risotto with mushroom.'],
			),
		]);

		const matchedRecipes = recipes.filter(recipe =>
			recipeMatchesFilter(recipe, queryParsed),
		);
		const matchedRecipesTitles = new Set(
			matchedRecipes.map(recipe => recipe.title),
		);

		expect(matchedRecipesTitles).toStrictEqual(expectedTitlesSet);
	},
);
