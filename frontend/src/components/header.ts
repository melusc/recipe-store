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

import {RelativeUrl} from '@lusc/util/relative-url';

import {$} from '../$.js';
import type {RouteMetadata} from '../routes/_utilities.js';

import {searchForm} from './search-form.js';

export function header({user, url}: RouteMetadata) {
	const loginUrl = new RelativeUrl('/login');
	if (url) {
		loginUrl.searchParams.set('continue', url);
	}

	const routes = [
		{
			href: '/',
			name: 'Home',
		},
		...(user
			? [
					{
						href: '/recipe/new',
						name: 'Create New Recipe',
					},
					{
						href: `/profile/${user.userId}`,
						name: 'Profile',
					},
					{
						href: '/account',
						name: 'Account',
					},
					{
						href: '/logout',
						name: 'Logout',
					},
				]
			: [
					{
						href: loginUrl.href,
						name: 'Login',
					},
				]),
	];

	return $`
		<header class="sticky-top shadow-sm bg-primary">
			<nav class="navbar navbar-expand-lg p-3">
			  <div class="container-fluid">
					<a
						class="navbar-brand ${url === '/' ? 'active' : ''}"
						aria-current="${url === '/' ? 'page' : 'false'}"
						href="/"
					>Recipe Store</a>

					<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarHeader" aria-controls="navbarHeader" aria-expanded="false" aria-label="Toggle navigation">
      			<span class="navbar-toggler-icon"></span>
					</button>


					<div class="collapse navbar-collapse" id="navbarHeader">
						<ul class="navbar-nav me-auto mb-2 mb-lg-0">
							${routes.map(
								({href, name}) => $`
									<li class="nav-item">
										<a
											class="nav-link${url === href ? ' active' : ''}"
											aria-current="${url === href ? 'page' : 'false'}"
											href="${href}"
										>
											${name}
										</a>
									</li>
								`,
							)}
						</ul>

						${searchForm('header')}
					</div>
				</div>
			</nav>
		</header>
	`;
}
