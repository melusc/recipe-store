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

const timeElements =
	document.querySelectorAll<HTMLTimeElement>('time[datetime]');

function formatDateTime(date: Date, display: string | undefined) {
	if (display === 'date') {
		return date.toLocaleDateString();
	}

	if (display === 'time') {
		return date.toLocaleTimeString();
	}

	return date.toLocaleString();
}

for (const timeElement of timeElements) {
	const date = new Date(timeElement.dateTime);

	timeElement.textContent = formatDateTime(
		date,
		timeElement.dataset['display'],
	);
}
