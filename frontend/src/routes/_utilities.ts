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

import {readFile} from 'node:fs/promises';

import type {User} from 'api';

import {$, type SafeString} from '../$.js';
import {header} from '../components/header.js';

// eslint-disable-next-line security/detect-non-literal-fs-filename
const baseHtml = await readFile(
	new URL('../../src/base.html', import.meta.url),
	'utf8',
);

export function createRoute<Parameters extends readonly unknown[]>(
	title: string,
	template: (
		user: User | undefined,
		...parameters: Parameters
	) => SafeString | undefined,
) {
	return (
		user: User | undefined,
		path: string,
		...templateParameters: Parameters
	) =>
		$`
		${$.trusted(baseHtml)}

		${title ? $`<title>${title} | Recipe Store</title>` : undefined}

		${header(user, path)}

		<div id="App" class="m-3">
			${template(user, ...templateParameters)}
		</div>
	`.render();
}
