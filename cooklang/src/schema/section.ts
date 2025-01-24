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
import {array, literal, number, object, string, union} from 'zod';
import type z from 'zod';

/* @__PURE__ */
const textItem = object({
	type: literal('text'),
	value: string(),
}).readonly();

/* @__PURE__ */
const timerReference = object({
	type: literal('timer'),
	index: number().int().gte(0),
}).readonly();

/* @__PURE__ */
const cookwareReference = object({
	type: literal('cookware'),
	index: number().int().gte(0),
}).readonly();

/* @__PURE__ */
const ingredientReference = object({
	type: literal('ingredient'),
	index: number().int().gte(0),
}).readonly();

/* @__PURE__ */
export const stepItems = array(
	union([textItem, timerReference, cookwareReference, ingredientReference]),
).readonly();

/* @__PURE__ */
export const stepSchema = object({
	type: literal('step'),
	value: object({
		items: stepItems,
	}).readonly(),
}).readonly();

export type Step = z.infer<typeof stepSchema>;
