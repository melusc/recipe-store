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
	cookwareToText,
	ingredientToText,
	timerToText,
} from './schema/cooking-items.js';
import {cooklangSectionSchema, type CooklangSection} from './schema/index.js';

import {Parser} from '#wasm';

export {cooklangSectionSchema, type CooklangSection} from './schema/index.js';

export class ParseError extends Error {}

let parser: Parser | undefined;

export function parseSection(section: string) {
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
	if (errorResult.error) {
		throw new ParseError('Unknown error');
	}

	return cooklangSectionSchema.parse(parsedResult);
}

const cache = new WeakMap<CooklangSection, string>();
export function sectionToText(section: CooklangSection) {
	const cachedValue = cache.get(section);
	if (cachedValue) {
		return cachedValue;
	}

	const result: string[] = [];
	const {cookware, ingredients, timers} = section;

	for (const item of section.steps) {
		switch (item.type) {
			case 'text': {
				result.push(item.value);
				break;
			}
			case 'cookware': {
				result.push(cookwareToText(cookware[item.index]!, true));
				break;
			}
			case 'timer': {
				result.push(timerToText(timers[item.index]!));
				break;
			}
			case 'ingredient': {
				result.push(ingredientToText(ingredients[item.index]!, true));
				break;
			}
		}
	}

	const joined = result.join('').trim();
	cache.set(section, joined);
	return joined;
}

export {ingredientToText} from './schema/cooking-items.js';
export {stringifyQuantity} from './schema/quantity.js';
