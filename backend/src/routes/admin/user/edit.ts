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
import {Router} from 'express';

import {readAccountForm} from '../../../form-validation/account.ts';
import {csrf} from '../../../middleware/token.ts';
import {formdataMiddleware} from '../../../upload.ts';

export const adminUserEditRouter = Router();

adminUserEditRouter.get('/:id', (request, response, next) => {
	const id = Number.parseInt(request.params.id, 10);
	const user = response.locals.api.User.fromUserid(id);

	if (!user) {
		next();
		return;
	}

	response.send$.admin.userEdit(user, false, undefined);
});

adminUserEditRouter.post(
	'/:id',
	formdataMiddleware.none(),
	(request, response, next) => {
		const id = Number.parseInt(request.params['id']!, 10);
		const user = response.locals.api.User.fromUserid(id);

		if (!user) {
			next();
			return;
		}

		if (!csrf.validate(request, response)) {
			response.status(403).send$.admin.userEdit(user, false, undefined);
			return;
		}

		const requestUser = response.locals.user!;
		const errors: string[] = [];
		const body = (request.body ?? {}) as Record<string, unknown>;

		let role = user.role;
		if (requestUser.permissionToChangeRole(user)) {
			try {
				role = readAccountForm.role(body);
			} catch (error: unknown) {
				if (error instanceof Error) {
					errors.push(error.message);
				} else {
					errors.push('Internal error.');
				}
			}
		}

		let username = user.username;
		try {
			username = readAccountForm.username(body);
		} catch (error: unknown) {
			if (error instanceof Error) {
				errors.push(error.message);
			} else {
				errors.push('Internal error.');
			}
		}

		let displayName = user.displayName;
		try {
			displayName = readAccountForm.displayName(body);
		} catch (error: unknown) {
			if (error instanceof Error) {
				errors.push(error.message);
			} else {
				errors.push('Internal error.');
			}
		}

		if (errors.length === 0) {
			try {
				user.changeUsername(username);
			} catch (error: unknown) {
				if (error instanceof Error) {
					errors.push(error.message);
				} else {
					errors.push('Internal error.');
				}
			}
		}

		if (errors.length > 0) {
			response.status(400).send$.admin.userEdit(user, false, errors);
			return;
		}

		let newPassword: string | undefined;
		if (errors.length === 0 && Object.hasOwn(body, 'reset-password')) {
			newPassword = generatePassword();
			user.resetPassword(newPassword);
			user.updateRequirePasswordChange(true);
		}

		if (requestUser.permissionToChangeRole(user)) {
			user.changeRole(role);
		}
		user.changeDisplayName(displayName);

		response.send$.admin.userEdit(user, true, errors, newPassword);
	},
);
