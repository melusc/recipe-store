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

export type ReadonlyDate = Readonly<Omit<Date, `set${string}`>>;

export class PaginationResult<T> {
	public readonly pageCount: number;
	public readonly page: number;
	public readonly items: readonly T[];

	constructor({
		pageCount,
		page,
		items,
	}: {
		readonly pageCount: number;
		readonly page: number;
		readonly items: readonly T[];
	}) {
		this.pageCount = pageCount;
		this.page = page;
		this.items = items;
	}

	getNextPage() {
		if (this.page >= this.pageCount) {
			return false;
		}

		// If page is negative for some reason,
		// skip to page 1
		return Math.max(1, this.page + 1);
	}

	getPreviousPage() {
		if (this.page <= 1) {
			return false;
		}

		// If page is way too high
		// skip to last page
		return Math.min(this.pageCount, this.page - 1);
	}
}
