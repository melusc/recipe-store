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

import {UserDeletion} from '../../api/dist/src/api/user';

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
		false,
	);

	console.log(
		'Created owner-user "%s" with password %s',
		createOwnerUsername,
		password,
	);
}

await Promise.all(
	api.User.all().map(user => user.deleteUser(UserDeletion.DeleteRecipes)),
);

const username = 'lnjfs';
const password = 'c4,y4dDE(T=XP(4y(GM~PnZT>Dwk?sa)';
console.log(username, password);
const user = api.User.create(
	username,
	username,
	password,
	UserRoles.Owner,
	false,
);

await api.Recipe.create(
	'Recipe 1',
	user,
	undefined,
	undefined,
	undefined,
	['milk', 'example'],
	['Add @milk'],
);

await api.Recipe.create(
	'Recipe 2',
	user,
	undefined,
	'Grandmother',
	'2h',
	['pineapple', 'example'],
	['Add @pineapple{1 g} and @apple{3}', 'Add @pineapple{1 g} and @apple{3}'],
);

await Promise.all(
	Array.from({length: 30}, (_v, index) =>
		api.Recipe.create(
			`Recipe ${index + 3}`,
			user,
			undefined,
			undefined,
			undefined,
			['pineapple', 'example'],
			[`Add @pineapple${index + 3}`],
		),
	),
);

const app = setupServer(api);
const port = 3108;

app.listen(port, () => {
	console.log('Server listening on http://localhost:%s', port);
});
