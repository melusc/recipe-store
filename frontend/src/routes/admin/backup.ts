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
import {centeredMain} from '../../components/centered-main.js';
import {formError} from '../../components/form-error.js';
import {createRoute} from '../_utilities.js';

export const renderAdminBackup = createRoute(
	(
		{csrfToken},
		restoreSuccess: boolean,
		error?: {
			download?: string;
			restore?: string;
			skippedUsers?: string[];
		},
	) => ({
		title: 'Reset Recipe Store',
		body: centeredMain($`
			<h1>Backup Management</h1>
			
			<section>
				<h2>Create Backup</h2>
				${formError(error?.download)}
				<form action="/admin/backup/download" method="POST" enctype="multipart/form-data">
					<input type="hidden" name="csrf-token" value="${csrfToken}">

					<button role="submit" class="btn btn-primary">
						Download backup
					</button>
				</form>
			</section>
			<section class="mt-4">
				<h2>Restore from backup</h2>
				${formError(error?.restore)}
				${
					restoreSuccess &&
					$`
						<div class="alert alert-success" role="alert">
							Successfully restored data.
						</div>
					`
				}
				${
					error?.skippedUsers &&
					error.skippedUsers.length > 0 &&
					$`
						<div class="alert alert-warning" role="alert">
							Skipped following duplicate users:
							<ul>
								${error.skippedUsers.map(user => $`<li>${user}</li>`)}
							</ul>
						</div>
					`
				}
				<div class="alert alert-info" role="alert">
					This does not reset the store. If you want to restore to an older version,
					manually delete the data-directory first.
				</div>
				<form class="d-flex flex-column gap-3" method="POST" action="/admin/backup/restore" enctype="multipart/form-data">
					<input type="hidden" name="csrf-token" value="${csrfToken}">

					<div>
						<label
							for="backup-file"
							class="form-label"
						>
							Backup-File
						</label>
						<input
							type="file"
							class="form-control"
							name="backup-file"
							id="backup-file"
							accept="application/zip"
							required
						>
					</div>
					<button role="submit" class="btn btn-primary">
						Upload backup
					</button>
				</form>
			</section>
		`),
	}),
);
