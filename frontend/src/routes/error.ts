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

import {$} from '../$.js';

import {createRoute} from './_utilities.js';

const createErrorRoute = (title: string, body: string) =>
	createRoute(() => ({
		title,
		body: $`
			<div
				class="position-absolute top-50 start-50 translate-middle"
			>
				<h1>${body}</h1>
			</div>
		`,
	}));

export const renderError = {
	404: createErrorRoute('404 - Not Found', '404 - Not Found :('),
	401: createErrorRoute('401 - Unauthorised', 'Unauthorised'),
	500: createErrorRoute('500 - Internal Error', 'Internal error.'),
};
