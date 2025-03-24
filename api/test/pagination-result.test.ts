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

import {test, expect, describe} from 'vitest';

import {
	DynamicPaginationResult,
	PaginationResult,
} from '../src/api/utilities.js';

describe('PaginationResult', () => {
	test('normal usage', () => {
		const paginationResult = new PaginationResult({
			page: 30,
			lastPage: 50,
			perPageLimit: 20,
			items: ['abc', 'def'],
		});

		expect(paginationResult.page).toStrictEqual(30);
		expect(paginationResult.lastPage).toStrictEqual(50);
		expect(paginationResult.perPageLimit).toStrictEqual(20);
		expect(paginationResult.items).toStrictEqual(['abc', 'def']);

		expect(paginationResult.getPreviousPage()).toStrictEqual(29);
		expect(paginationResult.getNextPage()).toStrictEqual(31);
	});

	test('first page', () => {
		const paginationResult = new PaginationResult({
			page: 1,
			lastPage: 20,
			perPageLimit: 4,
			items: ['you', 'lost', 'the', 'game'],
		});

		expect(paginationResult.page).toStrictEqual(1);
		expect(paginationResult.perPageLimit).toStrictEqual(4);
		expect(paginationResult.getPreviousPage()).toStrictEqual(false);
		expect(paginationResult.getNextPage()).toStrictEqual(2);
	});

	test('last page', () => {
		const paginationResult = new PaginationResult({
			page: 15,
			lastPage: 15,
			perPageLimit: 20,
			items: ['alpha', 'beta'],
		});

		expect(paginationResult.page).toStrictEqual(15);

		expect(paginationResult.getPreviousPage()).toStrictEqual(14);
		expect(paginationResult.getNextPage()).toStrictEqual(false);
	});

	test('only page', () => {
		const paginationResult = new PaginationResult({
			page: 1,
			lastPage: 1,
			perPageLimit: 20,
			items: ['banana', 'bread'],
		});

		expect(paginationResult.page).toStrictEqual(1);
		expect(paginationResult.getNextPage()).toStrictEqual(false);
		expect(paginationResult.getPreviousPage()).toStrictEqual(false);
	});

	test('out of bounds lower', () => {
		const paginationResult = new PaginationResult({
			page: -3,
			lastPage: 3,
			perPageLimit: 20,
			items: [],
		});

		expect(paginationResult.page).toStrictEqual(-3);
		expect(paginationResult.getNextPage()).toStrictEqual(1);
		expect(paginationResult.getPreviousPage()).toStrictEqual(false);
	});

	test('out of bounds upper', () => {
		const paginationResult = new PaginationResult({
			page: 25,
			lastPage: 20,
			perPageLimit: 20,
			items: [],
		});

		expect(paginationResult.page).toStrictEqual(25);
		expect(paginationResult.getNextPage()).toStrictEqual(false);
		expect(paginationResult.getPreviousPage()).toStrictEqual(20);
	});
});

describe('DynamicPaginationResult', () => {
	test('normal usage', () => {
		const paginationResult = new DynamicPaginationResult({
			page: 30,
			items: ['abc', 'def'],
			perPageLimit: 20,
			hasNextPage: true,
		});

		expect(paginationResult.page).toStrictEqual(30);
		expect(paginationResult.items).toStrictEqual(['abc', 'def']);

		expect(paginationResult.getPreviousPage()).toStrictEqual(29);
		expect(paginationResult.getNextPage()).toStrictEqual(31);
	});

	test('first page', () => {
		const paginationResult = new DynamicPaginationResult({
			page: 1,
			items: ['you', 'lost', 'the', 'game'],
			perPageLimit: 20,
			hasNextPage: true,
		});

		expect(paginationResult.page).toStrictEqual(1);
		expect(paginationResult.getPreviousPage()).toStrictEqual(false);
		expect(paginationResult.getNextPage()).toStrictEqual(2);
	});

	test('last page', () => {
		const paginationResult = new DynamicPaginationResult({
			page: 15,
			items: ['alpha', 'beta'],
			perPageLimit: 20,
			hasNextPage: false,
		});

		expect(paginationResult.page).toStrictEqual(15);

		expect(paginationResult.getPreviousPage()).toStrictEqual(14);
		expect(paginationResult.getNextPage()).toStrictEqual(false);
	});

	test('only page', () => {
		const paginationResult = new DynamicPaginationResult({
			page: 1,
			items: ['banana', 'bread'],
			perPageLimit: 20,
			hasNextPage: false,
		});

		expect(paginationResult.page).toStrictEqual(1);
		expect(paginationResult.getNextPage()).toStrictEqual(false);
		expect(paginationResult.getPreviousPage()).toStrictEqual(false);
	});

	test('out of bounds lower', () => {
		const paginationResult = new DynamicPaginationResult({
			page: -3,
			items: [],
			hasNextPage: true,
			perPageLimit: 20,
		});

		expect(paginationResult.page).toStrictEqual(-3);
		expect(paginationResult.getNextPage()).toStrictEqual(1);
		expect(paginationResult.getPreviousPage()).toStrictEqual(false);
	});

	test('out of bounds upper', () => {
		const paginationResult = new DynamicPaginationResult({
			page: 25,
			items: [],
			lastPage: 20,
			hasNextPage: false,
			perPageLimit: 20,
		});

		expect(paginationResult.page).toStrictEqual(25);
		expect(paginationResult.getNextPage()).toStrictEqual(false);
		expect(paginationResult.getPreviousPage()).toStrictEqual(20);
	});
});
