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

import {UserDeletion, UserRoles} from 'api';
import {Router} from 'express';
import {render} from 'frontend';

import {readAccountForm} from '../form-validation/account.ts';
import {csrf, session} from '../middleware/token.ts';
import {formdataMiddleware} from '../upload.ts';

export const accountRouter = Router();

accountRouter.use(session.guard(UserRoles.User));

accountRouter.get('/', (_request, response) => {
	response.send(
		render.account(
			{
				user: response.locals.user,
				url: '/account',
			},
			csrf.generate(response.locals.user),
			false,
		),
	);
});

accountRouter.post('/', formdataMiddleware.none(), (request, response) => {
	const user = response.locals.user!;
	const body = (request.body ?? {}) as Record<string, unknown>;
	const errors = [];

	if (!csrf.validate(request, response)) {
		response.send(400).send(
			render.account(
				{
					user: response.locals.user,
					url: '/account',
				},
				csrf.generate(response.locals.user),
				false,
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

	if (body['new-password']) {
		try {
			const newPassword = readAccountForm.newPasswords(body);
			const currentPassword = readAccountForm.currentPassword(body);

			user.changePassword(currentPassword, newPassword);
		} catch (error: unknown) {
			if (error instanceof Error) {
				errors.push(error.message);
			} else {
				errors.push('Internal error.');
			}
		}
	}

	if (errors.length > 0) {
		response.status(400);
	}

	response.send(
		render.account(
			{
				user: response.locals.user,
				url: '/account',
			},
			csrf.generate(response.locals.user),
			errors.length === 0,
			errors,
		),
	);
});

accountRouter.get('/delete', (_request, response) => {
	response.send(
		render.accountDelete(
			{
				user: response.locals.user,
				url: '/account/delete',
			},
			csrf.generate(response.locals.user),
		),
	);
});

accountRouter.post(
	'/delete',
	formdataMiddleware.none(),
	async (request, response) => {
		if (!csrf.validate(request, response)) {
			response.status(400).send(
				render.accountDelete(
					{
						user: response.locals.user,
						url: '/account/delete',
					},
					csrf.generate(response.locals.user),
					'Could not validate CSRF Token. Please try again.',
				),
			);
			return;
		}

		const body = (request.body ?? {}) as Record<string, unknown>;
		const password = body['password'];
		const shouldDeleteRecipes = body['delete-recipes'] === 'on';

		if (typeof password !== 'string' || !password) {
			response.status(400).send(
				render.accountDelete(
					{
						user: response.locals.user,
						url: '/account/delete',
					},
					csrf.generate(response.locals.user),
					'Missing password.',
				),
			);
			return;
		}

		try {
			response.locals.user!.confirmPassword(password);
		} catch {
			response.status(400).send(
				render.accountDelete(
					{
						user: response.locals.user,
						url: '/account/delete',
					},
					csrf.generate(response.locals.user),
					'Incorrect password. Please try again.',
				),
			);
			return;
		}

		try {
			await response.locals.user?.deleteUser(
				shouldDeleteRecipes
					? UserDeletion.DeleteRecipes
					: UserDeletion.KeepRecipes,
			);
		} catch {
			response.status(400).send(
				render.accountDelete(
					{
						user: response.locals.user,
						url: '/account/delete',
					},
					csrf.generate(response.locals.user),
					'Could not complete your request. Please try again or contact an admin.',
				),
			);
			return;
		}

		session.clearCookie(response);
		response.redirect(303, '/');
	},
);
