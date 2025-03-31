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

(() => {
	/** @type {HTMLDivElement} */
	const noJsInput = document.querySelector('#tags-nojs-parent');
	noJsInput.classList.add('d-none');
	// Prevent stale data being used
	// Don't even send it to the server
	// Scenario in mind: User wants to remove all tags,
	// server sees no `tags-js` so it uses `tags-nojs`
	noJsInput.querySelector('input').name = '';

	/** @type {HTMLDivElement} */
	const jsInput = document.querySelector('#js-tags');
	jsInput.classList.remove('d-none');

	/** @type {HTMLInputElement} */
	const tagsInput = document.querySelector('#tags-input');

	/** @type {HTMLTemplateElement} */
	const tagTemplate = document.querySelector('#tag-template');

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

				/** @type {HTMLElement} */
				const tag = tagTemplate.content.cloneNode(true);
				tag.querySelector('input[name="tags-js"]').value = item;
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
			event.preventDefault();
			splitIntoTags(true);
		}
	});

	/** @param {Event} event */
	function handleButton(event) {
		const target = event.target;
		if (!(target instanceof Element)) {
			return;
		}

		if (target.matches('#btn-remove-tag, #btn-remove-tag *')) {
			target.closest('#tag-parent').remove();
			event.stopImmediatePropagation();
			event.preventDefault();
		}
	}

	tagsInput.addEventListener('input', () => {
		splitIntoTags();
	});

	jsInput.addEventListener('click', event => {
		handleButton(event);
	});
	jsInput.addEventListener('keypress', event => {
		const code = event.code.toLowerCase();
		if (code === 'enter' || code === 'space') {
			handleButton(event);
		}
	});
})();
