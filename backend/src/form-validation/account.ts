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

function checkPasswordRules(password: string) {
	return (
		password.length >= 10 &&
		/\d/.test(password) &&
		/[a-z]/.test(password) &&
		/[A-Z]/.test(password) &&
		/[^a-z\d]/i.test(password)
	);
}

export const readAccountForm = {
	newPasswords(body: Record<string, unknown>) {
		const newPassword = body['new-password'];
		const newPasswordRepeat = body['new-password-repeat'];

		if (
			typeof newPassword !== 'string' ||
			!newPasswordRepeat ||
			newPasswordRepeat !== newPassword
		) {
			throw new Error('The two new passwords did not match.');
		}

		if (!checkPasswordRules(newPassword)) {
			throw new Error('New password does not match password requirements.');
		}

		return newPassword;
	},
	currentPassword(body: Record<string, unknown>) {
		const currentPassword = body['current-password'];

		if (!currentPassword || typeof currentPassword !== 'string') {
			throw new Error(
				'Cannot change password without confirming current password.',
			);
		}

		return currentPassword;
	},
};
