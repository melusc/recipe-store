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

import type {RouteCommon} from './routes/_utilities.js';
import {renderAccountDelete} from './routes/account/delete.js';
import {renderAccountEdit} from './routes/account/edit.js';
import {createRenderAdmin} from './routes/admin/index.js';
import {createRenderError} from './routes/error.js';
import {renderIndex} from './routes/index.js';
import {renderLogin} from './routes/login.js';
import {renderRecipeDelete} from './routes/recipe/delete.js';
import {renderEditRecipe} from './routes/recipe/edit.js';
import {renderNewRecipe} from './routes/recipe/new.js';
import {renderViewRecipe} from './routes/recipe/view.js';
import {renderRequiredPasswordChange} from './routes/required-password-change.js';
import {renderSearch} from './routes/search.js';
import {renderUser} from './routes/user.js';

export function createRender(common: RouteCommon) {
	return {
		index: renderIndex(common),
		error: createRenderError(common),
		login: renderLogin(common),
		search: renderSearch(common),
		account: renderAccountEdit(common),
		user: renderUser(common),
		accountDelete: renderAccountDelete(common),
		requiredPasswordChange: renderRequiredPasswordChange(common),
		newRecipe: renderNewRecipe(common),
		viewRecipe: renderViewRecipe(common),
		editRecipe: renderEditRecipe(common),
		deleteRecipe: renderRecipeDelete(common),
		admin: createRenderAdmin(common),
	} as const;
}

export type Routes = ReturnType<typeof createRender>;

export type {RecipePrefill} from './components/recipe-form.js';
