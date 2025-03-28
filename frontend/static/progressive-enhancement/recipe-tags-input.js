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

/** @type {HTMLDivElement} */
const noJsInput = document.querySelector('#no-js-tags');
noJsInput.classList.add('d-none');

/** @type {HTMLDivElement} */
const jsInput = document.querySelector('#js-tags');
jsInput.classList.remove('d-none');

/** @type {HTMLInputElement} */
const tagsInput = document.querySelector('#tags-input');

/**
 * @param {string} inputText
 * @returns {HTMLDivElement}
 */
function generateTag(inputText) {
	const parent = document.createElement('div');
	parent.classList.add(
		'btn',
		'btn-theme',
		'd-flex',
		'flex-row',
		'col-12',
		'col-md-4',
		'col-lg-2',
	);

	const input = document.createElement('input');
	input.type = 'text';
	input.name = 'tags-js';
	input.classList.add('bg-transparent', 'border-0', 'flex-grow-1');
	input.value = inputText;

	const removeButton = document.createElement('button');
	removeButton.type = 'button';
	removeButton.ariaLabel = 'Remove tag';
	removeButton.classList.add('btn-close');

	parent.append(input, removeButton);

	return parent;
}

/**
 * @param {boolean} shouldAddAll
 */
function splitIntoTags(shouldAddAll) {
	const text = tagsInput.value;
	let cursorLocation =
		tagsInput.selectionDirection === 'backward'
			? tagsInput.selectionStart
			: tagsInput.selectionEnd;

	const split = text.split(',');

	if (split.length > 1 || shouldAddAll) {
		const relevantParts = shouldAddAll ? split : split.slice(0, -1);
		for (let item of relevantParts) {
			cursorLocation -= item.length + 1;
			item = item.trim();

			if (!item) {
				continue;
			}

			const tag = generateTag(item);
			tagsInput.before(tag);
		}

		tagsInput.value = shouldAddAll ? '' : split.at(-1);

		tagsInput.selectionStart = tagsInput.selectionEnd = Math.max(
			cursorLocation,
			0,
		);
	}
}

tagsInput.addEventListener('keydown', event => {
	if (event.code && event.code.toLowerCase() === 'enter') {
		event.stopImmediatePropagation();
		splitIntoTags(true);
	}
});

tagsInput.addEventListener('input', () => {
	splitIntoTags();
});

jsInput.addEventListener('click', event => {
	const {target} = event;
	if (!(target instanceof HTMLElement)) {
		return;
	}

	if (target.classList.contains('btn-close')) {
		target.parentElement.remove();
	}
});

splitIntoTags(true);
