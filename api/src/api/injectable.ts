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

import type {InternalApiOptions} from './index.js';

/*
This solves the problem of Recipe and User
needing access to `InternalApiOptions` in some way.

I tried a function `createUser(apiOptions)`
and `type User = ReturnType<typeof createUser>`.
The problem is that the types are fucked.
TypeScript cannot figure it out and constantly had issues.
I always had to use `InstanceType<User>`.
Normally `User` and `typeof User` is possible without any issues.

Instead the idea is `createApi` creates a simple class that extends `User`,
and overrides `get apiOptions`.

I'm sure there is a library that solves issues like this, but I haven't found one
after quick googling.
*/

export class InjectableApi {
	/** @internal */
	get apiOptions(): InternalApiOptions {
		throw new Error('API Options not injected.');
	}

	/** @internal */
	static get apiOptions(): InternalApiOptions {
		throw new Error('API Options not injected.');
	}

	/** @internal */
	get User() {
		return this.apiOptions.User;
	}

	/** @internal */
	static get User() {
		return this.apiOptions.User;
	}

	/** @internal */
	get Recipe() {
		return this.apiOptions.Recipe;
	}

	/** @internal */
	static get Recipe() {
		return this.apiOptions.Recipe;
	}

	/** @internal */
	get Image() {
		return this.apiOptions.Image;
	}

	/** @internal */
	static get Image() {
		return this.apiOptions.Image;
	}

	/** @internal */
	get imageDirectory() {
		return this.apiOptions.imageDirectory;
	}

	/** @internal */
	static get imageDirectory() {
		return this.apiOptions.imageDirectory;
	}

	/** @internal */
	get temporaryImageDirectory() {
		return this.apiOptions.temporaryImageDirectory;
	}

	/** @internal */
	static get temporaryImageDirectory() {
		return this.apiOptions.temporaryImageDirectory;
	}

	/** @internal */
	get database() {
		return this.apiOptions.database;
	}

	/** @internal */
	static get database() {
		return this.apiOptions.database;
	}
}
