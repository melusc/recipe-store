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

import {UserRoles} from 'api';
import {Router} from 'express';

import {createBackup, restoreBackup} from '../../backup.ts';
import {csrf, session} from '../../middleware/token.ts';
import {formdataMiddleware} from '../../upload.ts';

export const adminBackupRouter = Router();

adminBackupRouter.use(session.guard(UserRoles.Admin));

adminBackupRouter.get('/', (_request, response) => {
	response.send$.admin.backup(false);
});

adminBackupRouter.post(
	'/download',
	formdataMiddleware.none(),
	async (request, response) => {
		if (!csrf.validate(request, response)) {
			response.send$.admin.backup(false, {
				download: 'Could not validate CSRF Token. Please try again.',
			});
			return;
		}

		const {filename, stream} = await createBackup(response.locals.api);
		response.header(
			'Content-Disposition',
			`attachment; filename="${filename}"`,
		);
		response.header('Content-Type', 'application/zip');
		stream.pipe(response);
	},
);

adminBackupRouter.post(
	'/restore',
	formdataMiddleware.single('backup-file'),
	async (request, response) => {
		if (!csrf.validate(request, response)) {
			response.status(403).send$.admin.backup(false, {
				restore: 'Could not validate CSRF Token. Please try again.',
			});
			return;
		}

		const zipFile = request.file;
		if (!zipFile) {
			response.status(400).send$.admin.backup(false, {
				restore: 'Missing required backup file.',
			});
			return;
		}

		try {
			const skippedUsers = await restoreBackup(
				response.locals.api,
				zipFile.buffer,
			);
			response.status(200).send$.admin.backup(true, {
				skippedUsers,
			});
		} catch (error: unknown) {
			response.status(400).send$.admin.backup(false, {
				restore: error instanceof Error ? error.message : 'Unknown error.',
			});
		}
	},
);
