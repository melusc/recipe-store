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
import {$} from '../$.js';

import {createRoute} from './_utilities.js';

export const renderLogin = createRoute(
	'Login',
	(error: string | undefined) => $`
		<div class="row mt-5 justify-content-center">
			<div class="col-4">
				<h2>Login</h2>
				<form method="POST" action="/login" enctype="multipart/form-data">
					<div class="mb-3">
						<label for="username" class="form-label">Username</label>
						<input
							type="text"
							class="form-control"
							id="username"
							name="username"
						>
					</div>
					<div class="mb-3">
						<label for="password" class="form-label">Password</label>
						<input
							type="password"
							class="form-control"
							id="password"
							name="password"
						>
					</div>

					${
						error &&
						$`<div class="alert alert-danger" role="alert">
            ${error}
        	</div>`
					}

					<button type="submit" class="btn btn-primary">Submit</button>
				</form>
			</div>
		</div>
	`,
);
