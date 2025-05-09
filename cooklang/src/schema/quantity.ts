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
import {literal, number, object, string} from 'zod';
import type z from 'zod';

/* @__PURE__ */
const regularNumberQuantity = object({
	type: literal('regular'),
	value: number(),
}).readonly();

/* @__PURE__ */
const fractionNumberQuantity = object({
	type: literal('fraction'),
	value: object({
		whole: number().int(),
		num: number().int(),
		den: number().int(),
		err: number(),
	}),
}).readonly();

/* @__PURE__ */
const numberQuantity = object({
	type: literal('number'),
	value: regularNumberQuantity.or(fractionNumberQuantity),
}).readonly();

type NumberQuantity = z.infer<typeof numberQuantity>;

/* @__PURE__ */
const textQuantity = object({
	type: literal('text'),
	value: string(),
}).readonly();

/* @__PURE__ */
const fixedQuantity = object({
	type: literal('fixed'),
	value: textQuantity.or(numberQuantity),
}).readonly();

/* @__PURE__ */
const linearQuantity = object({
	type: literal('linear'),
	value: numberQuantity,
}).readonly();

/* @__PURE__ */
export const unitlessQuantitySchema = fixedQuantity.or(linearQuantity);

/* @__PURE__ */
export const quantitySchema = object({
	unit: string().nullable(),
	value: unitlessQuantitySchema,
}).readonly();

export type UnitlessQuantity = z.infer<typeof unitlessQuantitySchema>;
export type Quantity = z.infer<typeof quantitySchema>;

function stringifyNumberQuantity(quantity: NumberQuantity) {
	if (quantity.value.type === 'regular') {
		return quantity.value.value.toString(10);
	}

	const {whole, num, den} = quantity.value.value;

	if (whole) {
		return `${whole} ${num}/${den}`;
	}

	return `${num}/${den}`;
}

export function stringifyQuantity(
	quantity: Quantity | UnitlessQuantity,
): string {
	if ('unit' in quantity) {
		const unit = quantity.unit ? ` ${quantity.unit}` : '';
		return `${stringifyQuantity(quantity.value as unknown as UnitlessQuantity)}${unit}`;
	}

	if (quantity.type === 'linear') {
		return stringifyNumberQuantity(quantity.value);
	}

	if (quantity.value.type === 'number') {
		return stringifyNumberQuantity(quantity.value);
	}

	return quantity.value.value;
}
