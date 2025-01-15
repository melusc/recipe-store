/*!
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

import {parseArgs} from 'node:util';

import {generatePassword} from '@lusc/util/generate-password';
import {createApi, UserRoles} from 'api';

import {database, imageDirectory} from './data.ts';

const {
	values: {'create-owner': createOwnerUsername},
} = parseArgs({
	options: {
		'create-owner': {
			type: 'string',
		},
	},
});

const api = createApi({
	database,
	imageDirectory,
});

if (createOwnerUsername) {
	const password = generatePassword({length: 16});

	api.User.create(createOwnerUsername, password, UserRoles.Owner);

	console.log(
		'Created owner-user "%s" with password %s',
		createOwnerUsername,
		password,
	);
}
