import {object, string} from 'zod';
import type z from 'zod';

import {quantitySchema, unitlessQuantitySchema} from './quantity.js';

/* @__PURE__ */
export const ingredientSchema = object({
	name: string(),
	alias: string().nullable(),
	quantity: quantitySchema,
	note: string().nullable(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;

/* @__PURE__ */
export const cookwareSchema = object({
	name: string(),
	alias: string().nullable(),
	quantity: unitlessQuantitySchema,
	note: string().nullable(),
});

export type Cookware = z.infer<typeof cookwareSchema>;

/* @__PURE__ */
export const timerSchema = object({
	name: string().nullable(),
	quantity: quantitySchema,
});

export type Timer = z.infer<typeof timerSchema>;
