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
			content: array(stepSchema).length(1).readonly(),
		}).readonly(),
	)
		.max(1)
		.readonly(),
	ingredients: array(ingredientSchema).readonly(),
	cookware: array(cookwareSchema).readonly(),
	timers: array(timerSchema).readonly(),
})
	.transform(({sections, ...rest}) => ({
		...rest,
		steps: sections[0]?.content[0]!.value.items ?? [],
	}))
	.readonly();

export type CooklangSection = z.infer<typeof cooklangSectionSchema>;
