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

import {generatePassword} from '@lusc/util/generate-password';
import {ApiError, UserRoles} from 'api';
import {Router} from 'express';
import {render} from 'frontend';

import {readAccountForm} from '../../../form-validation/account.ts';
import {csrf} from '../../../middleware/token.ts';
import {formdataMiddleware} from '../../../upload.ts';

export const adminNewUserRoute = Router();

adminNewUserRoute.get('/', (request, response) => {
	response.send(
		render.admin.newUser(
			{
				user: response.locals.user,
				url: request.originalUrl,
			},
			csrf.generate(response.locals.user),
			undefined,
		),
	);
});

adminNewUserRoute.post('/', formdataMiddleware.none(), (request, response) => {
	const requestUser = response.locals.user!;

	if (!csrf.validate(request, response)) {
		response.status(403).send(
			render.admin.newUser(
				{
					user: requestUser,
					url: request.originalUrl,
				},
				csrf.generate(requestUser),
			),
		);
		return;
	}

	const errors = [];
	const body = (request.body ?? {}) as Record<string, unknown>;
	let username: string;
	try {
		username = readAccountForm.username(body);
	} catch (error: unknown) {
		if (error instanceof Error) {
			errors.push(error.message);
		} else {
			errors.push('Internal Error.');
		}
	}

	let role = UserRoles.User;
	if (requestUser.role === UserRoles.Owner) {
		try {
			role = readAccountForm.role(body);
		} catch (error: unknown) {
			if (error instanceof Error) {
				errors.push(error.message);
			} else {
				errors.push('Internal Error.');
			}
		}
	}

	if (errors.length > 0) {
		response.status(400).send(
			render.admin.newUser(
				{
					user: requestUser,
					url: request.originalUrl,
				},
				csrf.generate(requestUser),
				errors,
			),
		);
		return;
	}

	try {
		const password = generatePassword();
		const user = response.locals.api.User.create(
			username!,
			username!,
			password,
			role,
			true,
		);

		response.status(201).send(
			render.admin.newUserResult(
				{
					user: requestUser,
					url: request.originalUrl,
				},
				user,
				password,
			),
		);
	} catch (error: unknown) {
		response.status(409).send(
			render.admin.newUser(
				{
					user: requestUser,
					url: request.originalUrl,
				},
				csrf.generate(requestUser),
				[(error as ApiError).message],
			),
		);
	}
});
