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

import {readFile} from 'node:fs/promises';

import type {User} from 'api';
import type {ComponentChildren} from 'preact';
import {render} from 'preact-render-to-string';

import {Header} from '../components/header.js';

const baseHtml = await readFile(
	new URL('../../src/base.html', import.meta.url),
	'utf8',
);

export type RouteCommon = {
	requestUser: User | undefined;
	url: string;
	csrfToken: string;
	onRender(html: string): void;
};

export function createRoute<Parameters extends readonly unknown[]>(
	template: (
		routeMetadata: RouteCommon,
		...parameters: Parameters
	) => {
		title: string;
		body: ComponentChildren | undefined;
	},
) {
	return (routeMetadata: RouteCommon) =>
		(...templateParameters: Parameters) => {
			const {title, body} = template(routeMetadata, ...templateParameters);

			routeMetadata.onRender(
				baseHtml +
					render(
						<>
							<title>{title} | Recipe Store</title>

							<body>
								<Header
									user={routeMetadata.requestUser}
									url={routeMetadata.url}
								/>

								<div id="App" class="m-3 d-flex flex-column gap-3">
									{body}
								</div>
							</body>
						</>,
					),
			);
		};
}
