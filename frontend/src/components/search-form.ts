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

import {$} from '../$.js';

export function searchForm(
	location: 'header' | 'inline',
	prefillQuery?: string,
) {
	const input = $`
		<input
			class="form-control"
			type="search"
			placeholder="Search"
			aria-label="Search"
			name="q"
			value="${prefillQuery || ''}"
		>
	`;

	const button = $`
		<button
			class="btn btn-outline-success"
			type="submit"
		>
			Search
		</button>
	`;

	return $`
		<form class="d-flex gap-2" role="search" action="/search" method="GET">
			${location === 'header' ? [input, button] : [button, input]}
		</form>
	`;
}
