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

import {$, type SafeString} from '../$.js';
import {header} from '../components/header.js';

// eslint-disable-next-line security/detect-non-literal-fs-filename
const baseHtml = await readFile(
	new URL('../../src/base.html', import.meta.url),
	'utf8',
);

export type RouteMetadata = {
	user: User | undefined;
	url: string | undefined;
};

export function createRoute<Parameters extends readonly unknown[]>(
	template: (
		routeMetadata: RouteMetadata,
		...parameters: Parameters
	) => {
		title: string;
		body: SafeString | undefined;
	},
) {
	return (routeMetadata: RouteMetadata, ...templateParameters: Parameters) => {
		const {title, body} = template(routeMetadata, ...templateParameters);

		return $`
			${$.trusted(baseHtml)}

			<title>${title} | Recipe Store</title>

			${header(routeMetadata)}

			<div id="App" class="m-3 d-flex flex-column gap-3">
				${body}
			</div>
		`.render();
	};
}
