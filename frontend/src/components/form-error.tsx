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

export function FormError({
	errors,
}: {
	errors: readonly string[] | string | undefined;
}) {
	if (typeof errors === 'string') {
		errors = [errors];
	}

	if (!errors || errors.length === 0) {
		return;
	}

	return (
		<div class="alert alert-danger" role="alert">
			{errors.length === 1 && errors[0]!}
			{errors.length > 1 && (
				<ul>
					{errors.map(error => (
						<li>{error}</li>
					))}
				</ul>
			)}
		</div>
	);
}
