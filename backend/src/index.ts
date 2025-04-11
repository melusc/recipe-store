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

import {parseArgs} from 'node:util';

import {generatePassword} from '@lusc/util/generate-password';
import {createApi, UserRoles} from 'api';

import {database, imageDirectory, temporaryImageDirectory} from './data.ts';
import {setupServer} from './server.js';

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
	temporaryImageDirectory: temporaryImageDirectory,
});

if (createOwnerUsername) {
	const password = generatePassword({length: 16});

	api.User.create(
		createOwnerUsername,
		createOwnerUsername,
		password,
		UserRoles.Owner,
		false,
	);

	console.log(
		'Created owner-user "%s" with password %s',
		createOwnerUsername,
		password,
	);
}

const app = setupServer(api);
const port = 3108;

app.listen(port, error => {
	if (error) {
		throw error;
	}

	console.log('Server listening on http://localhost:%s', port);
});
