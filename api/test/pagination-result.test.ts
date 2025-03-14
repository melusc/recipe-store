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

import {test, expect} from 'vitest';

import {PaginationResult} from '../src/api/utilities.js';

test('PaginationResult normal usage', () => {
	const paginationResult = new PaginationResult({
		page: 30,
		pageCount: 50,
		items: ['abc', 'def'],
	});

	expect(paginationResult.page).toStrictEqual(30);
	expect(paginationResult.pageCount).toStrictEqual(50);
	expect(paginationResult.items).toStrictEqual(['abc', 'def']);

	expect(paginationResult.getPreviousPage()).toStrictEqual(29);
	expect(paginationResult.getNextPage()).toStrictEqual(31);
});

test('PaginationResult first page', () => {
	const paginationResult = new PaginationResult({
		page: 1,
		pageCount: 20,
		items: ['you', 'lost', 'the', 'game'],
	});

	expect(paginationResult.page).toStrictEqual(1);
	expect(paginationResult.getPreviousPage()).toStrictEqual(false);
	expect(paginationResult.getNextPage()).toStrictEqual(2);
});

test('PaginationResult last page', () => {
	const paginationResult = new PaginationResult({
		page: 15,
		pageCount: 15,
		items: ['alpha', 'beta'],
	});

	expect(paginationResult.page).toStrictEqual(15);

	expect(paginationResult.getPreviousPage()).toStrictEqual(14);
	expect(paginationResult.getNextPage()).toStrictEqual(false);
});

test('PaginationResult only page', () => {
	const paginationResult = new PaginationResult({
		page: 1,
		pageCount: 1,
		items: ['banana', 'bread'],
	});

	expect(paginationResult.page).toStrictEqual(1);
	expect(paginationResult.getNextPage()).toStrictEqual(false);
	expect(paginationResult.getPreviousPage()).toStrictEqual(false);
});

test('PaginationResult out of bounds lower', () => {
	const paginationResult = new PaginationResult({
		page: -3,
		pageCount: 3,
		items: [],
	});

	expect(paginationResult.page).toStrictEqual(-3);
	expect(paginationResult.getNextPage()).toStrictEqual(1);
	expect(paginationResult.getPreviousPage()).toStrictEqual(false);
});

test('PaginationResult out of bounds upper', () => {
	const paginationResult = new PaginationResult({
		page: 25,
		pageCount: 20,
		items: [],
	});

	expect(paginationResult.page).toStrictEqual(25);
	expect(paginationResult.getNextPage()).toStrictEqual(false);
	expect(paginationResult.getPreviousPage()).toStrictEqual(20);
});
