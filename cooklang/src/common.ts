import {
	stringifyCookware,
	stringifyIngredient,
	stringifyTimer,
} from './schema/cooking-items.js';
import {cooklangSectionSchema, type CooklangSection} from './schema/index.js';

type FallibleResult = {
	free(): void;
	value: string;
	error: string;
};

type Parser = {
	free(this: Parser): void;
	parse(this: Parser, input: string): FallibleResult;
};

type ParserClass = {
	new (): Parser;
};

export class ParseError extends Error {}

let parser: Parser | undefined;

export function parseSection(section: string, Parser: ParserClass) {
	// Collapse all whitespace to single whitespace
	// Collapse all newlines to ["\", "\n"]
	section = section.replaceAll(/\s+/g, s => (s.includes('\n') ? '\\\n' : ' '));

	// No need for these features, escaping with backslash disables them
	// `=` is used to indicate section titles
	// `>` is used for notes
	section = section.replaceAll(/[=>]/g, String.raw`\$&`);

	parser ??= new Parser();

	const result = parser.parse(section);

	const {error, value} = result;

	if (error.trim()) {
		throw new ParseError(error);
	}

	result.free();

	const parsedResult = JSON.parse(value) as unknown;
	const errorResult = parsedResult as {error?: boolean};
	if ('error' in errorResult && errorResult['error'] === true) {
		throw new ParseError('Unknown error');
	}

	return cooklangSectionSchema.parse(parsedResult);
}

export function stringifySection(section: CooklangSection) {
	const result: string[] = [];
	const {cookware, ingredients, timers} = section;

	for (const item of section.steps) {
		switch (item.type) {
			case 'text': {
				result.push(item.value);
				break;
			}
			case 'cookware': {
				result.push(stringifyCookware(cookware[item.index]!));
				break;
			}
			case 'timer': {
				result.push(stringifyTimer(timers[item.index]!));
				break;
			}
			case 'ingredient': {
				result.push(stringifyIngredient(ingredients[item.index]!));
				break;
			}
		}
	}

	return result.join('').trim();
}
