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

import {createWriteStream} from 'node:fs';
import {readFile} from 'node:fs/promises';
import process from 'node:process';
import {parseArgs} from 'node:util';

import {generatePassword} from '@lusc/util/generate-password';
import {createApi, UserRoles} from 'api';

import {createBackup, restoreBackup} from './backup.ts';
import {cleanImages, cleanupBeforeExit} from './cleanup.ts';
import {database, imageDirectory, temporaryImageDirectory} from './data.ts';
import env from './env.ts';
import {setupServer} from './server.ts';

const {
	values: {
		'create-owner': createOwnerUsername,
		'create-backup': shouldCreateBackup,
		'restore-backup': restoreBackupPath,
	},
} = parseArgs({
	options: {
		'create-owner': {
			type: 'string',
		},
		'create-backup': {
			type: 'boolean',
			default: false,
		},
		'restore-backup': {
			type: 'string',
		},
	},
});

const api = createApi({
	database,
	imageDirectory,
	temporaryImageDirectory: temporaryImageDirectory,
});

await cleanImages(api, imageDirectory);

if (shouldCreateBackup) {
	const {filename, stream} = await createBackup(api);
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const writeStream = createWriteStream(filename);
	stream.pipe(writeStream);
	console.log('Saving backup to', filename);
}

if (restoreBackupPath !== undefined) {
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const zip = await readFile(restoreBackupPath);
	const skippedUsers = await restoreBackup(api, zip);
	if (skippedUsers.length > 0) {
		console.debug('Skipped creating users:');
		for (const user of skippedUsers) {
			console.debug(`  - ${user}`);
		}
	}
}

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

const server = app.listen(env.port, '127.0.0.1', error => {
	if (error) {
		throw error;
	}

	console.log('Server listening on http://localhost:%s', env.port);
	process.send?.('ready');
});

cleanupBeforeExit(() => {
	server.close();
	database.close();
});
