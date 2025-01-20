import {test, expect} from 'vitest';

import {parseStep} from '../../src/node.js';
import {
	// cookwareSchema,
	ingredientSchema,
	timerSchema,
	type Ingredient,
	type Timer,
} from '../../src/schema/cooking-items.js';

test.for<[string, Omit<Ingredient, 'quantity'>]>([
	[
		'@chili',
		{
			name: 'chili',
			alias: null,
			note: null,
		},
	],
	[
		'@chili{}',
		{
			name: 'chili',
			alias: null,
			note: null,
		},
	],
	[
		// Same as @abc{}|def
		'@abc|def',
		{
			name: 'abc',
			alias: null,
			note: null,
		},
	],
	[
		'@abc|def{}',
		{
			name: 'abc',
			alias: 'def',
			note: null,
		},
	],
	[
		'@abc(def)',
		{
			name: 'abc',
			alias: null,
			note: 'def',
		},
	],
	[
		'@abc{}(def)',
		{
			name: 'abc',
			alias: null,
			note: 'def',
		},
	],
	[
		'@abc|ghi{}(def)',
		{
			name: 'abc',
			alias: 'ghi',
			note: 'def',
		},
	],
])('Parse ingredients %j', ([ingredientsInput, expected]) => {
	const parsed = parseStep(`Add ${ingredientsInput}.`) as {
		ingredients: Ingredient[];
	};
	expect(parsed.ingredients).to.have.length(1);

	let ingredientsOut!: Omit<Ingredient, 'quantity'>;
	expect(() => {
		ingredientsOut = ingredientSchema
			.omit({quantity: true})
			.parse(parsed.ingredients[0]);
	}).not.to.throw();

	expect(ingredientsOut).to.deep.equal(expected);
});

// only test .name. .quantity is tested in quantity.test.ts
test.for<[string, string | null]>([['~{10 minutes}', null]])(
	'Parse timer %j',
	([timerInput, expected]) => {
		const parsed = parseStep(`Cook for ${timerInput}.`) as {
			timers: Timer[];
		};

		expect(parsed.timers).to.have.length(1);

		let name!: string | null;

		expect(() => {
			name = timerSchema.parse(parsed.timers[0]!).name;
		}).not.to.throw();

		expect(name).to.equal(expected);
	},
);
