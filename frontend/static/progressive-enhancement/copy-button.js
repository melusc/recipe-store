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

/** @type {NodeListOf<HTMLElement>} */
const copyButtons = document.querySelectorAll('button[data-copy]');

/**
 * @param {HTMLElement} targetButton
 */
function handleCopy(targetButton) {
	const targetInput = document.querySelector(targetButton.dataset.target);
	if (targetInput) {
		// eslint-disable-next-line n/no-unsupported-features/node-builtins
		navigator.clipboard.writeText(targetInput.value ?? targetInput.textContent);
	}
}

for (const copyButton of copyButtons) {
	copyButton.addEventListener('click', () => {
		handleCopy(copyButton);
	});

	copyButton.addEventListener('keydown', event => {
		const code = event.code.toLowerCase();
		if (code === 'space' || code === 'enter') {
			handleCopy(copyButton);
		}
	});
}
