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

import {QueryParser, type QueryFilter} from '../src/api/search.js';

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
		['', []],
		[' ', []],
	])('parse(%j)', ([query, expectedParsed]) => {
		const queryParser = new QueryParser(query);
		const parsed = queryParser.parse();

		expect(parsed).toStrictEqual(expectedParsed);
	});
});
