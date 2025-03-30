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

export function iconCross() {
	return $`<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 256 256"
		style="vertical-align: top"
	>
  	<path
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="bevel"
			stroke-width="24"
			d="M12 12L244 244M12 244L244 12"
		/>
	</svg>`;
}
