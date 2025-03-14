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

export function header(loggedIn: boolean) {
	return $`
		<header class="sticky-top bg-primary shadow-sm">
			<nav class="p-3 d-flex flex-row">
				<h2 class="fw-semibold">
					<a href="/">Home</a>
				</h2>
				<h3 class="fw-semibold ms-auto">
					<a
						class="header-login"
						href="${loggedIn ? '/logout' : '/login'}"
					>
						${loggedIn ? 'Logout' : 'Login'}
					</a>
				</h3>
			</nav>
		</header>
	`;
}
