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

export function PasswordRequirements({required}: {required: boolean}) {
	return (
		<div class="alert alert-info">
			{!required && (
				<div>
					Leave password fields empty, if you don't want to change your
					password.
				</div>
			)}
			<div>New password must match the following criteria:</div>
			<ul>
				<li>Contains a special character</li>
				<li>Contains a number</li>
				<li>Contains a lowercase letter</li>
				<li>Contains an uppercase letter</li>
				<li>Is at least 10 characters long</li>
			</ul>
		</div>
	);
}
