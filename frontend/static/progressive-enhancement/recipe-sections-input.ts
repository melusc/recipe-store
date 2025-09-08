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

const noJsSections = document.querySelector<HTMLElement>(
	'#sections-nojs-parent',
)!;
// noJs-textarea won't be updated
// noJs content gets prioritised serverside, so don't submit it
// so it doesn't get used
noJsSections.querySelector('textarea')!.name = '';
noJsSections.classList.add('d-none');

const jsSections = document.querySelector<HTMLElement>('#js-sections')!;
jsSections.classList.remove('d-none');

const addStepButton =
	document.querySelector<HTMLButtonElement>('#btn-add-step')!;

const rowTemplate = document.querySelector<HTMLTemplateElement>(
	'#section-row-template',
)!;

function addStep() {
	addStepButton.before(rowTemplate.content.cloneNode(true));
}

function removeStep(target: HTMLElement) {
	target.closest('#step-parent')!.remove();
}

function handleButton(event: Event) {
	const target = event.target;
	if (!(target instanceof HTMLElement)) {
		return;
	}

	if (target.matches('#btn-add-step, #btn-add-step *')) {
		addStep();
		event.stopImmediatePropagation();
	} else if (target.matches('#btn-remove-step, #btn-remove-step *')) {
		removeStep(target);
		event.stopImmediatePropagation();
	}
}

jsSections.addEventListener('click', event => {
	handleButton(event);
});
jsSections.addEventListener('keypress', event => {
	const code = event.code.toLowerCase();
	if (code === 'space' || code === 'enter') {
		handleButton(event);
	}
});
