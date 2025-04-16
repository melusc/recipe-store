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

import {$} from '../../$.js';

export function iconCopy(size: string) {
	return $`
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			style="vertical-align: top; height: ${size}; width: ${size}"
		>
			<path
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="23.203"
				d="M173.287 203.914V236.4H19.6V82.713h32.485m30.627-63.112H236.4v153.686H82.713Z"
			/>
		</svg>
`;
}
