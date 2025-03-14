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

export function header(loggedIn: boolean, path: string) {
	const active = {
		'/login': 'login-logout',
		'/logout': 'login-logout',
		'/': 'frontpage',
	}[path];

	const routes = [
		{
			href: '/',
			name: 'Home',
		},
		loggedIn
			? {
					href: '/logout',
					name: 'Logout',
				}
			: {
					href: '/login',
					name: 'Login',
				},
	];

	return $`
		<header class="sticky-top bg-primary shadow-sm">
			<nav class="navbar navbar-expand-lg p-3">
			  <div class="container-fluid">
					<a
						class="navbar-brand ${active === 'frontpage' ? 'active' : ''}"
						aria-current="${active === 'frontpage' ? 'page' : 'false'}"
						href="/"
					>Recipe Store</a>

					<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      			<span class="navbar-toggler-icon"></span>
					</button>


					<div class="collapse navbar-collapse" id="navbarSupportedContent">
						<ul class="navbar-nav me-auto mb-2 mb-lg-0">
							${routes.map(
								({href, name}) => $`
									<li class="nav-item">
										<a
											class="nav-link${path === href ? ' active' : ''}"
											aria-current="${path === href ? 'page' : 'false'}"
											href="${href}"
										>
											${name}
										</a>
									</li>
								`,
							)}
						</ul>

						<form class="d-flex" role="search" action="/search">
        			<input
								class="form-control me-2"
								type="search"
								placeholder="Search"
								aria-label="Search"
								name="q"
							>
        			<button
								class="btn btn-outline-success"
								type="submit"
							>
								Search
							</button>
      			</form>
					</div>
				</div>
			</nav>
		</header>
	`;
}
