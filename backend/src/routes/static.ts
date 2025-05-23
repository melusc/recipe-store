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

import {fileURLToPath} from 'node:url';

import express, {Router} from 'express';

import {imageDirectory, temporaryImageDirectory} from '../data.ts';

export const staticRouter = Router();

const options = {
	index: false,
	dotfiles: 'ignore',
};

const staticDirectory = fileURLToPath(import.meta.resolve('frontend/static'));
staticRouter.use('/', express.static(staticDirectory, options));

const bootstrapDirectory = fileURLToPath(import.meta.resolve('bootstrap-slim'));
staticRouter.use('/', express.static(bootstrapDirectory, options));

const userContentImages = fileURLToPath(imageDirectory);
staticRouter.use('/user-content', express.static(userContentImages, options));

const temporaryUserContentImages = fileURLToPath(temporaryImageDirectory);
staticRouter.use(
	'/user-content',
	express.static(temporaryUserContentImages, options),
);
