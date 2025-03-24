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

import {RelativeUrl} from '@lusc/util/relative-url';
import {type DynamicPaginationResult, type Recipe} from 'api';

import {$} from '../$.js';

export function pagination(
	baseUrl: string,
	paginationResult: DynamicPaginationResult<Recipe>,
) {
	const {
		page: currentPage,
		lastPage: knownLastPage,
		perPageLimit,
	} = paginationResult;

	const previousPage = paginationResult.getPreviousPage();
	const nextPage = paginationResult.getNextPage();

	function resolveUrl(page: number | false) {
		if (page === false) {
			return '#';
		}

		const url = new RelativeUrl(baseUrl);
		url.searchParams.set('page', String(page));
		url.searchParams.set('limit', String(perPageLimit));
		return url.href;
	}

	// Normal pagination knows the last page
	// Dynamic pagination (e.g. search), only knows if there is a next page
	// If there is neither, the current page is last
	const dynamicLastPage = knownLastPage ?? (nextPage || currentPage);

	// Two before, two after
	// previous - 1 is two before
	// next + 1 same

	let low = previousPage || 1;
	low = Math.max(low - 1, 1);

	let high = nextPage || currentPage;
	high = Math.min(high + 1, dynamicLastPage);

	const pages = Array.from(
		{length: high - low + 1},
		(_v, index) => low + index,
	);

	return $`
		<nav aria-label="Page navigation" class="mt-3">
			<ul class="pagination justify-content-center">
				<li class="page-item ${previousPage === false ? 'disabled' : ''}">
					<a class="page-link" href="${resolveUrl(previousPage)}" aria-label="Previous">
						<span aria-hidden="true">&lt; Previous</span>
					</a>
				</li>
				${
					// Skip to first page if the first page isn't already one of the other buttons
					low > 1 &&
					$`
						<li class="page-item">
							<a class="page-link" href="${resolveUrl(1)}">1</a>
						</li>

						${
							// Ellipsis if it skips some pages
							low > 2 &&
							$`
								<li class="page-item">
									<span class="page-link user-select-none">...</span>
								</li>
							`
						}
					`
				}
				${pages.map(
					page => $`
						<li
							class="page-item ${page === currentPage ? 'active' : ''}"
						>
							<a
								class="page-link"
								href="${resolveUrl(page)}"
							>
								${String(page)}
							</a>
						</li>
					`,
				)}
				${
					// Skip to last page if the last page isn't already one of the other buttons
					knownLastPage !== undefined &&
					knownLastPage > high &&
					$`
						${
							// Ellipsis if it skips some pages
							knownLastPage > high + 1 &&
							$`
								<li class="page-item">
									<span class="page-link user-select-none">...</span>
								</li>
							`
						}

						<li class="page-item">
							<a class="page-link" href="${resolveUrl(knownLastPage)}">
								${String(knownLastPage)}
							</a>
						</li>
					`
				}
				<li class="page-item ${nextPage === false ? 'disabled' : ''}">
					<a class="page-link" href="${resolveUrl(nextPage)}" aria-label="Next">
						<span aria-hidden="true">Next &gt;</span>
					</a>
				</li>
			</ul>
		</nav>
	`;
}
