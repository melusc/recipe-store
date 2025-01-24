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

import {parseSection} from '../../src/node.js';
import {
	ingredientSchema,
	timerToText,
	timerSchema,
	type Ingredient,
} from '../../src/schema/cooking-items.js';

test.for<[string, Ingredient]>([
	[
		'@chili',
		{
			name: 'chili',
			alias: null,
			note: null,
			quantity: null,
		},
	],
	[
		'@chili{}',
		{
			name: 'chili',
			alias: null,
			note: null,
			quantity: null,
		},
	],
	[
		// Same as @abc{}|def
		'@abc|def',
		{
			name: 'abc',
			alias: null,
			note: null,
			quantity: null,
		},
	],
	[
		'@abc|def{}',
		{
			name: 'abc',
			alias: 'def',
			note: null,
			quantity: null,
		},
	],
	[
		'@abc(def)',
		{
			name: 'abc',
			alias: null,
			note: 'def',
			quantity: null,
		},
	],
	[
		'@abc{}(def)',
		{
			name: 'abc',
			alias: null,
			note: 'def',
			quantity: null,
		},
	],
	[
		'@abc|ghi{}(def)',
		{
			name: 'abc',
			alias: 'ghi',
			note: 'def',
			quantity: null,
		},
	],
])('Parse ingredients %j', ([ingredientsInput, expected]) => {
	const parsed = parseSection(`Add ${ingredientsInput}.`);
	expect(parsed.ingredients).toHaveLength(1);

	let ingredientsOut!: Omit<Ingredient, 'quantity'>;
	expect(() => {
		ingredientsOut = ingredientSchema.parse(parsed.ingredients[0]);
	}).not.to.throw();

	expect(ingredientsOut).toStrictEqual(expected);
});

// only test .name. .quantity is tested in quantity.test.ts
test.for<[string, string | null]>([['~{10 minutes}', null]])(
	'Parse timer %j',
	([timerInput, expected]) => {
		const parsed = parseSection(`Cook for ${timerInput}.`);

		expect(parsed.timers).toHaveLength(1);

		let name!: string | null;

		expect(() => {
			name = timerSchema.parse(parsed.timers[0]!).name;
		}).not.to.throw();

		expect(name).toStrictEqual(expected);
	},
);

test.for([
	['~oven{10%minutes}', '10 minutes'],
	['~{10%minutes}', '10 minutes'],
] as const)('stringifyTimer(%j)', ([input, output]) => {
	const parsed = parseSection(input);
	const timer = parsed.timers[0]!;
	expect(timerToText(timer)).toStrictEqual(output);
});
