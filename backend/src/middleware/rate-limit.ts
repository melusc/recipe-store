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

import type {RequestHandler} from 'express';
import rateLimitLib, {
	type Options as RateLimitOptions,
	type RateLimitRequestHandler,
} from 'express-rate-limit';

const baseOptions = {
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	validate: {
		// trust proxy is set from env variable
		// user knows risks
		trustProxy: false,
	},
} satisfies Partial<RateLimitOptions>;

export function rateLimit(): RequestHandler {
	const staticLimiter = rateLimitLib({
		windowMs: 5 * 60 * 1000, // 5 minutes
		limit: 500, // Limit each IP to 100 requests per window
		...baseOptions,
	});

	const getLimiter = rateLimitLib({
		windowMs: 5 * 60 * 1000,
		limit: 100,
		...baseOptions,
	});

	const postLimiter = rateLimitLib({
		windowMs: 15 * 60 * 1000,
		limit: 20,
		...baseOptions,
	});

	return async (request, response, next) => {
		let limiter: RateLimitRequestHandler;

		if (request.method === 'GET' || request.method === 'HEAD') {
			limiter = request.originalUrl.startsWith('/static/')
				? staticLimiter
				: getLimiter;
		} else {
			limiter = postLimiter;
		}

		await limiter(request, response, next);
	};
}
