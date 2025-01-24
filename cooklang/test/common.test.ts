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

import {test, expect} from 'vitest';

import {parseSection, stringifySection} from '../src/node.js';

test.for([
	'abc',
	'abc\ndef',
	'abc\n\ndef',
	'abc\r\n\r\ndef',
	'abc \r\n\r\n def',
	'abc \r\n.\r\n def',
	'> abc',
	String.raw`\> abc`,
	`= abc =`,
	String.raw`\= abc =`,
])('parseStep(%j)', input => {
	expect(JSON.stringify(parseSection(input))).toMatchSnapshot();
});

test.for([
	['Then add @salt and @ground pepper{}.', 'Then add salt and ground pepper.'],
	['--', ''],
	['> Abc', '> Abc'],
	['= Abc =\nDEF', '= Abc =\nDEF'],
	['Add [- comment -] @milk', 'Add  milk'],
	['Add @milk{1%meter}', 'Add milk'],
	['Use #oven{}.', 'Use oven.'],
	['Cook ~{10%minutes}', 'Cook 10 minutes'],
	['Cook ~eggs{10%minutes}', 'Cook 10 minutes'],
	[
		`Preheat oven to 180 °C.
		
Place in oven.`,
		`Preheat oven to 180 °C.
Place in oven.`,
	],
	[
		'Place @bacon strips{1%kg} on a baking sheet and glaze with @syrup{1/2%tbsp}.',
		'Place bacon strips on a baking sheet and glaze with syrup.',
	],
	[
		`A step,
the same step.

A different step.`,
		'A step,\nthe same step.\nA different step.',
	],
	[
		`-- Don't burn the roux!

Mash @potato{2%kg} until smooth -- alternatively, boil 'em first, then mash 'em, then stick 'em in a stew.`,
		'Mash potato until smooth',
	],
	[
		'Slowly add @milk{4%cup} [- TODO change units to litres -], keep mixing',
		'Slowly add milk , keep mixing',
	],
	[
		`Place the potatoes into a #pot.
Mash the potatoes with a #potato masher{}.`,
		`Place the potatoes into a pot.
Mash the potatoes with a potato masher.`,
	],
] as const)('stringify(%j)', ([input, output]) => {
	const parsedSection = parseSection(input);
	expect(stringifySection(parsedSection)).toStrictEqual(output);
});
