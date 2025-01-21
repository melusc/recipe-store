import {array, literal, number, object, string, union} from 'zod';
import type z from 'zod';

/* @__PURE__ */
const textItem = object({
	type: literal('text'),
	value: string(),
});

/* @__PURE__ */
const timerReference = object({
	type: literal('timer'),
	index: number().int().gte(0),
});

/* @__PURE__ */
const cookwareReference = object({
	type: literal('cookware'),
	index: number().int().gte(0),
});

/* @__PURE__ */
const ingredientReference = object({
	type: literal('ingredient'),
	index: number().int().gte(0),
});

/* @__PURE__ */
export const stepSchema = object({
	type: literal('step'),
	value: object({
		items: array(
			union([textItem, timerReference, cookwareReference, ingredientReference]),
		),
	}),
});

export type Step = z.infer<typeof stepSchema>;
