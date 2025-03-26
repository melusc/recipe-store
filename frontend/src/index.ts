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

import {renderAccount} from './routes/account.js';
import {renderError404} from './routes/error-404.js';
import {renderIndex} from './routes/index.js';
import {renderLogin} from './routes/login.js';
import {renderSearch} from './routes/search.js';

export const render = {
	index: renderIndex,
	error404: renderError404,
	login: renderLogin,
	search: renderSearch,
	account: renderAccount,
} as const;
