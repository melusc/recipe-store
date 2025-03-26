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
import {array, object, string} from 'zod';
import type z from 'zod';

import {
	cookwareSchema,
	ingredientSchema,
	timerSchema,
} from './cooking-items.js';
import {stepItems, stepSchema} from './section.js';

/* @__PURE__ */
const cooklangSectionBase = object({
	ingredients: array(ingredientSchema).readonly(),
	cookware: array(cookwareSchema).readonly(),
	timers: array(timerSchema).readonly(),
});

/* @__PURE__ */
const cooklangSectionFromInput = cooklangSectionBase
	.extend({
		sections: array(
			object({
				name: string().nullable(),
				content: array(stepSchema).length(1).readonly(),
			}).readonly(),
		)
			.max(1)
			.readonly(),
	})
	.transform(({sections, ...rest}) => ({
		...rest,
		steps: sections[0]?.content[0]!.value.items ?? [],
	}))
	.readonly();

// Allow for roundtrip:
// cooklangSectionSchema.parse(cooklangSectionSchema.parse(...))
// Necessary when storing to database and then retrieving it
/* @__PURE__ */
const cooklangSectionRoundtrip = cooklangSectionBase
	.extend({
		steps: stepItems,
	})
	.readonly();

/* @__PURE__ */
export const cooklangSectionSchema = cooklangSectionRoundtrip.or(
	cooklangSectionFromInput,
);

export type CooklangSection = z.infer<typeof cooklangSectionSchema>;
