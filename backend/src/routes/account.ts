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

import {ApiError} from 'api';
import {Router} from 'express';
import {render} from 'frontend';

import {csrf, CsrfFormType, session} from '../middleware/token.ts';
import {formdataMiddleware} from '../upload.ts';

export const accountRouter = Router();

accountRouter.use(session.guard());

accountRouter.get('/account', (_request, response) => {
	response.send(
		render.account(
			response.locals.user,
			'/account',
			csrf.generate(response.locals.user, CsrfFormType.account),
		),
	);
});

function checkPasswordRules(password: string) {
	return (
		password.length >= 10 &&
		/\d/.test(password) &&
		/[a-z]/.test(password) &&
		/[A-Z]/.test(password) &&
		/[^a-z\d]/i.test(password)
	);
}

accountRouter.post(
	'/account',
	formdataMiddleware.none(),
	(request, response) => {
		const user = response.locals.user!;

		const errors = [];

		if (typeof request.body !== 'object' || request.body === null) {
			response
				.send(400)
				.send(
					render.account(
						response.locals.user,
						'/account',
						csrf.generate(response.locals.user, CsrfFormType.account),
						['Unknown error. Please try again.'],
					),
				);
			return;
		}

		const body = request.body as Record<string, unknown>;
		if (!csrf.validate(CsrfFormType.account, request, response)) {
			response
				.send(400)
				.send(
					render.account(
						response.locals.user,
						'/account',
						csrf.generate(response.locals.user, CsrfFormType.account),
						['Could not validate CSRF Token. Please try again.'],
					),
				);
			return;
		}

		const username = body['username'];
		if (username && username !== user.username) {
			if (typeof username !== 'string' || username.length < 4) {
				errors.push('Username is too short.');
			} else {
				try {
					user.changeUsername(username);
				} catch {
					errors.push('Username is already in use.');
				}
			}
		}

		const displayName = body['displayname'];
		if (displayName && displayName !== user.displayName) {
			if (typeof displayName !== 'string' || displayName.length < 4) {
				errors.push('Display-Name is too short.');
			} else {
				user.changeDisplayName(displayName);
			}
		}

		const newPassword = body['new-password'];
		if (newPassword) {
			const newPasswordRepeat = body['new-password-repeat'];
			const currentPassword = body['current-password'];

			if (
				typeof newPassword !== 'string' ||
				!newPasswordRepeat ||
				newPasswordRepeat !== newPassword
			) {
				errors.push('The two new passwords did not match.');
			} else if (!currentPassword || typeof currentPassword !== 'string') {
				errors.push(
					'Cannot change password without confirming current password.',
				);
			}
			// eslint-disable-next-line unicorn/no-negated-condition
			else if (!checkPasswordRules(newPassword)) {
				errors.push('New password does not match password requirements.');
			} else {
				try {
					user.changePassword(currentPassword, newPassword);
				} catch (error: unknown) {
					if (error instanceof ApiError) {
						errors.push(error.message);
					} else {
						errors.push('Internal Error. Please try again.');
					}
				}
			}
		}

		if (errors.length > 0) {
			response.status(400);
		}

		response.send(
			render.account(
				response.locals.user,
				'/account',
				csrf.generate(response.locals.user, CsrfFormType.account),
				errors,
			),
		);
	},
);
