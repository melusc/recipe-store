import {literal, number, object, string} from 'zod';
import type z from 'zod';

/* @__PURE__ */
const regularNumberQuantity = object({
	type: literal('regular'),
	value: number(),
});

/* @__PURE__ */
const fractionNumberQuantity = object({
	type: literal('fraction'),
	value: object({
		whole: number().int(),
		num: number().int(),
		den: number().int(),
		err: number(),
	}),
});

/* @__PURE__ */
const numberQuantity = object({
	type: literal('number'),
	value: regularNumberQuantity.or(fractionNumberQuantity),
});

type NumberQuantity = z.infer<typeof numberQuantity>;

/* @__PURE__ */
const textQuantity = object({
	type: literal('text'),
	value: string(),
});

/* @__PURE__ */
const fixedQuantity = object({
	type: literal('fixed'),
	value: textQuantity.or(numberQuantity),
});

/* @__PURE__ */
const linearQuantity = object({
	type: literal('linear'),
	value: numberQuantity,
});

/* @__PURE__ */
export const unitlessQuantitySchema = fixedQuantity.or(linearQuantity);

/* @__PURE__ */
export const quantitySchema = object({
	unit: string().nullable(),
	value: unitlessQuantitySchema,
});

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
