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

import {IconCross} from './icons/cross.js';
import {IconPlus} from './icons/plus.js';

function SectionRow({section}: {section?: string}) {
	return (
		<div class="d-flex mb-2" id="step-parent">
			<textarea
				name="js-sections-input"
				placeholder="Recipe Step"
				class="form-control rounded-end-0"
				autocomplete="off"
				style={{
					resize: 'vertical',
				}}
			>
				{section}
			</textarea>
			<button
				class={[
					'btn btn-danger rounded-start-0',
					'd-flex align-items-center justify-content-center',
				].join(' ')}
				id="btn-remove-step"
				type="button"
				style={{
					width: '3em',
				}}
			>
				<span
					style={{
						height: '1em',
						width: '1em',
					}}
				>
					<IconCross />
				</span>
			</button>
		</div>
	);
}

export function RecipeSectionsInput({
	sections,
}: {
	sections: readonly string[] | undefined;
}) {
	sections ??= [];

	return (
		<>
			<div id="sections-nojs-parent">
				<label for="nojs-sections" class="form-label">
					Sections
				</label>
				<textarea
					name="nojs-sections"
					id="nojs-sections"
					placeholder="Enter sections. Separate each section by two line breaks."
					class="form-control"
					style={{
						minHeight: '500px',
					}}
					autocomplete="off"
				>
					{sections.join('\n\n')}
				</textarea>
			</div>
			<div class="d-none" id="js-sections">
				<label for="js-sections-input" class="form-label">
					Sections
				</label>
				<template id="section-row-template">
					<SectionRow />
				</template>
				{sections.map(section => (
					<SectionRow section={section} />
				))}
				<button
					type="button"
					aria-label="Add step"
					id="btn-add-step"
					class={[
						'btn btn-primary',
						'float-end',
						'd-flex align-items-center gap-2',
					].join(' ')}
				>
					Add step
					<span
						style={{
							height: '1em',
							width: '1em',
						}}
					>
						<IconPlus />
					</span>
				</button>
			</div>

			<script src="/static/progressive-enhancement/recipe-sections-input.js"></script>
		</>
	);
}
