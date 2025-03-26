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

import type {Request} from 'express';

const LIMIT_DEFAULT = 20;
const LIMIT_MIN = 10;
const LIMIT_MAX = 50;

export function resolvePaginationParameters(request: Request) {
	let page = Number.parseInt(request.search.get('page') ?? '1', 10);
	let limit = Number.parseInt(
		request.search.get('limit') ?? String(LIMIT_DEFAULT),
		10,
	);

	if (!Number.isSafeInteger(page)) {
		page = 1;
	}

	if (!Number.isSafeInteger(limit)) {
		limit = LIMIT_DEFAULT;
	}

	limit = Math.min(limit, LIMIT_MAX);
	limit = Math.max(limit, LIMIT_MIN);

	page = Math.max(page, 1);

	return {limit, page} as const;
}
