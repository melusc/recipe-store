import {array, object, string} from 'zod';
import type z from 'zod';

import {
	cookwareSchema,
	ingredientSchema,
	timerSchema,
} from './cooking-items.js';
import {stepSchema} from './section.js';

/* @__PURE__ */
export const cooklangSectionSchema = object({
	sections: array(
		object({
			name: string().nullable(),
			content: array(stepSchema).length(1),
		}),
	).max(1),
	ingredients: array(ingredientSchema),
	cookware: array(cookwareSchema),
	timers: array(timerSchema),
}).transform(({sections, ...rest}) => ({
	...rest,
	steps: sections[0]?.content[0]!.value.items ?? [],
}));

export type CooklangSection = z.infer<typeof cooklangSectionSchema>;
