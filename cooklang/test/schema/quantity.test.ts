import {test, assert, expect} from 'vitest';

import {ParseError} from '../../src/common.js';
import {parseSection} from '../../src/node.js';
import {
	stringifyQuantity,
	quantitySchema,
	type Quantity,
	unitlessQuantitySchema,
	type UnitlessQuantity,
} from '../../src/schema/quantity.js';

test.for([
	['one%slice', 'one slice'],
	['one slice', 'one slice'],
	['100*', '100'],
	['100*%g', '100 g'],
	['100', '100'],
	['100%m', '100 m'],
	['1.5%ft', '1.5 ft'],
	['1/2', '1/2'],
	['1/2%L', '1/2 L'],
	['1 1/2', '1 1/2'],
	['1 1/2%L', '1 1/2 L'],
	['1 300/401', '1 300/401'],
	['1 300/401%L', '1 300/401 L'],
	['1-2', '1-2'],
	['1-2%tbsp', '1-2 tbsp'],
])('Ingredient quantity stringify("%s") -> "%s"', ([input, output]) => {
	const cooklangSource = `@ingredient{${input}}`;
	const parsed = parseSection(cooklangSource) as {
		ingredients: Array<{quantity: Quantity}>;
	};
	assert('ingredients' in parsed);
	assert.containsAllKeys(parsed, ['ingredients']);
	assert.lengthOf(parsed.ingredients, 1);
	let quantity!: Quantity;
	assert.doesNotThrow(() => {
		quantity = quantitySchema.parse(parsed.ingredients[0]!.quantity);
	});

	assert.equal(stringifyQuantity(quantity), output);
});

test.for([
	['100%min', '100 min'],
	['1.5%h', '1.5 h'],
	['1/2%h', '1/2 h'],
	['1 1/2%s', '1 1/2 s'],
	['1 300/401%d', '1 300/401 d'],
])('Timer quantity stringify("%s") -> "%s"', ([input, output]) => {
	const cooklangSource = `~{${input}}`;
	const parsed = parseSection(cooklangSource) as {
		timers: Array<{quantity: Quantity}>;
	};
	assert('timers' in parsed);
	assert.containsAllKeys(parsed, ['timers']);
	assert.lengthOf(parsed.timers, 1);
	let quantity!: Quantity;
	assert.doesNotThrow(() => {
		quantity = quantitySchema.parse(parsed.timers[0]!.quantity);
	});

	assert.equal(stringifyQuantity(quantity), output);
});

test.for([
	// Unitless
	'100',
	// Not time unit
	'100%m',
	// Not number
	'ten%minute',
	'1-2%minute',
])('Invalid timer quantity %j', timerInput => {
	const cooklangSource = `~{${timerInput}}`;
	assert.throws(() => {
		parseSection(cooklangSource);
	}, ParseError);
});

test.for([
	['one', 'one'],
	['100', '100'],
	['1/2', '1/2'],
	['1 1/2', '1 1/2'],
	['1 300/401', '1 300/401'],
	['1-2', '1-2'],
])('Cookware quantity stringify("%s") -> "%s"', ([input, output]) => {
	const cooklangSource = `#a{${input}}`;
	const parsed = parseSection(cooklangSource) as {
		cookware: Array<{quantity: UnitlessQuantity}>;
	};
	assert('cookware' in parsed);
	assert.containsAllKeys(parsed, ['cookware']);
	assert.lengthOf(parsed.cookware, 1);
	expect(parsed.cookware[0]).toMatchSnapshot();
	let quantity!: UnitlessQuantity;
	assert.doesNotThrow(() => {
		quantity = unitlessQuantitySchema.parse(parsed.cookware[0]!.quantity);
	});

	assert.equal(stringifyQuantity(quantity), output);
});

test.for(['1%g', 'one%g'])('Invalid cookware quantity %j', cookwareInput => {
	const cooklangSource = `#a{${cookwareInput}}`;
	assert.throws(() => {
		parseSection(cooklangSource);
	}, ParseError);
});
