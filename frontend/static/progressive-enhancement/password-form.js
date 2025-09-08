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

/** @type {HTMLFormElement} */
const form = document.querySelector('#account-form');
/** @type {readonly HTMLInputElement[]} */
const passwordInputs = [...form.querySelectorAll('input[type="password"]')];
/** @type {HTMLInputElement} */
const newPasswordInput = form.querySelector('#new-password');
/** @type {HTMLInputElement} */
const newPasswordRepeatInput = form.querySelector('#new-password-repeat');

const allPasswordsRequired = passwordInputs.every(input => input.required);

/**
 * @param {string} password
 */
function checkPasswordValidity(password) {
	if (password.length < 10) {
		return 'too short';
	}

	if (!/\d/.test(password)) {
		return 'no number';
	}

	if (!/[a-z]/.test(password)) {
		return 'no lowercase letter';
	}

	if (!/[A-Z]/.test(password)) {
		return 'no uppercase letter';
	}

	if (!/[^a-z\d]/i.test(password)) {
		return 'no special character';
	}

	return true;
}

for (const input of passwordInputs) {
	input.addEventListener('change', () => {
		// If they are optional, mark all as required
		// as soon as one has a value
		// But don't accidentally make them optional
		// if they were required to begin with
		if (!allPasswordsRequired) {
			let hasFilledInput = passwordInputs.some(input => !!input.value);

			for (const input of passwordInputs) {
				input.required = hasFilledInput;
			}
		}

		// Don't check if current password matches requirements.
		if (input !== newPasswordInput || input !== newPasswordRepeatInput) {
			return;
		}

		const validity = !input.value || checkPasswordValidity(input.value);
		if (validity === true) {
			input.setCustomValidity('');
		} else {
			input.setCustomValidity(
				`Password does not match requirements (${validity}).`,
			);
		}

		if (newPasswordInput.value === newPasswordRepeatInput.value) {
			newPasswordRepeatInput.setCustomValidity('');
		} else {
			newPasswordRepeatInput.setCustomValidity('Passwords do not match.');
		}
	});
}
