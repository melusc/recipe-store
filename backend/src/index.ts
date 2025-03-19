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
});

if (createOwnerUsername) {
	const password = generatePassword({length: 16});

	api.User.create(
		createOwnerUsername,
		createOwnerUsername,
		password,
		UserRoles.Owner,
	);

	console.log(
		'Created owner-user "%s" with password %s',
		createOwnerUsername,
		password,
	);
}

await Promise.all(api.Recipe.all().map(recipe => recipe.delete()));

await api.Recipe.create(
	'recipe 1',
	api.User.all()[0]!,
	undefined,
	['milk', 'example'],
	['Add @milk'],
);

await api.Recipe.create(
	'recipe 2',
	api.User.all()[0]!,
	undefined,
	['pineapple', 'example'],
	['Add @pineapple'],
);

const username = generatePassword({
	length: 5,
	lowercase: true,
	uppercase: false,
	special: false,
	number: false,
});
const password = generatePassword();
api.User.create(username, username, password, UserRoles.Owner);
console.log(username, password);

const app = setupServer(api);
const port = 3108;

app.listen(port, () => {
	console.log('Server listening on http://localhost:%s', port);
});
