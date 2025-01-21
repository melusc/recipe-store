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
});

export type Ingredient = z.infer<typeof ingredientSchema>;

/* @__PURE__ */
export const cookwareSchema = object({
	name: string(),
	alias: string().nullable(),
	quantity: unitlessQuantitySchema.nullable(),
	note: string().nullable(),
});

export type Cookware = z.infer<typeof cookwareSchema>;

/* @__PURE__ */
export const timerSchema = object({
	name: string().nullable(),
	quantity: quantitySchema,
});

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
