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

import {Router} from 'express';

import {adminUserDeleteRouter} from './delete.ts';
import {adminUserEditRouter} from './edit.ts';
import {adminUserListRouter} from './list.ts';
import {adminNewUserRouter} from './new.ts';

export const adminUserRouter = Router();

adminUserRouter.use('/users', adminUserListRouter);
adminUserRouter.use('/user/new', adminNewUserRouter);
adminUserRouter.use('/user', adminUserEditRouter);
adminUserRouter.use('/user', adminUserDeleteRouter);
