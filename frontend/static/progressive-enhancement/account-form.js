/** @type {HTMLFormElement} */
const form = document.querySelector('#account-form');
/** @type {readonly HTMLInputElement[]} */
const passwordInputs = [...form.querySelectorAll('input[type="password"]')];
/** @type {HTMLInputElement} */
const newPasswordInput = form.querySelector('#new-password');
/** @type {HTMLInputElement} */
const newPasswordRepeatInput = form.querySelector('#new-password-repeat');

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
		let hasFilledInput = passwordInputs.some(input => !!input.value);

		for (const input of passwordInputs) {
			input.required = hasFilledInput;
		}

		// Don't check if current password matches requirements.
		// Otherwise, if they get more strict, it won't allow submitting it
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
