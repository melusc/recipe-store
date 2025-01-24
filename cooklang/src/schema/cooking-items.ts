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
import {object, string} from 'zod';
import type z from 'zod';

import {
	quantitySchema,
	stringifyQuantity,
	unitlessQuantitySchema,
} from './quantity.js';

/* @__PURE__ */
export const ingredientSchema = object({
	name: string(),
	alias: string().nullable(),
	quantity: quantitySchema.nullable(),
	note: string().nullable(),
}).readonly();

export type Ingredient = z.infer<typeof ingredientSchema>;

/* @__PURE__ */
export const cookwareSchema = object({
	name: string(),
	alias: string().nullable(),
	quantity: unitlessQuantitySchema.nullable(),
	note: string().nullable(),
}).readonly();

export type Cookware = z.infer<typeof cookwareSchema>;

/* @__PURE__ */
export const timerSchema = object({
	name: string().nullable(),
	quantity: quantitySchema,
}).readonly();

export type Timer = z.infer<typeof timerSchema>;

function stringifyIngredientOrCookware(item: Ingredient | Cookware) {
	const result: string[] = [];

	if (item.alias) {
		result.push(item.alias);
	} else if (item.name) {
		result.push(item.name);
	}

	if (item.note) {
		result.push(' (', item.note, ')');
	}

	return result.join('');
}

export function stringifyIngredient(item: Ingredient) {
	return stringifyIngredientOrCookware(item);
}

export function stringifyCookware(item: Cookware) {
	return stringifyIngredientOrCookware(item);
}

export function stringifyTimer(item: Timer) {
	return stringifyQuantity(item.quantity);
}
