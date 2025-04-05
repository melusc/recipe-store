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

import type {Buffer} from 'node:buffer';
import {randomBytes} from 'node:crypto';
import {readFile, rm, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';

import {fileTypeFromBuffer} from 'file-type';

import {ApiError} from './error.js';
import {InjectableApi} from './injectable.js';

export enum ImageSaveType {
	TemporaryImage,
	PermanentImage,
}

async function validateAndGetExtension(image: Buffer) {
	const allowedImageMimes: ReadonlySet<string> = new Set([
		'image/jpeg',
		'image/png',
		'image/webp',
	]);

	if (image.byteLength > 10e6) {
		throw new ApiError('Image is too large. Maximum of 10 MB is allowed.');
	}

	const fileType = await fileTypeFromBuffer(image);
	if (fileType && allowedImageMimes.has(fileType.mime)) {
		return fileType.ext;
	}

	throw new ApiError('Invalid image. Allowed images are JPG, PNG, and WEBP.');
}

const privateConstructorKey = Symbol();

export class Image extends InjectableApi {
	constructor(
		readonly name: string,
		readonly saveType: ImageSaveType,
		constructorKey: symbol,
	) {
		if (constructorKey !== privateConstructorKey) {
			throw new TypeError('Image.constructor is private.');
		}

		super();
	}

	private _resolvePath() {
		return this.Image._resolvePath(this.name, this.saveType);
	}

	private static _resolvePath(name: string, saveType: ImageSaveType) {
		return new URL(
			name,
			saveType === ImageSaveType.PermanentImage
				? this.imageDirectory
				: this.temporaryImageDirectory,
		);
	}

	isPermanent() {
		return this.saveType === ImageSaveType.PermanentImage;
	}

	isTemporary() {
		return this.saveType === ImageSaveType.TemporaryImage;
	}

	async read() {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		return readFile(this._resolvePath());
	}

	static async fromName(name: string): Promise<Image | undefined> {
		name = path.basename(name);

		const permanentPath = this._resolvePath(name, ImageSaveType.PermanentImage);
		try {
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			await stat(permanentPath);
			return new this.Image(
				name,
				ImageSaveType.PermanentImage,
				privateConstructorKey,
			);
		} catch {}

		const temporaryPath = this._resolvePath(name, ImageSaveType.TemporaryImage);
		try {
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			await stat(temporaryPath);
			return new this.Image(
				name,
				ImageSaveType.TemporaryImage,
				privateConstructorKey,
			);
		} catch {}

		return;
	}

	async rm() {
		await rm(this._resolvePath());
	}

	static async create(image: Buffer, saveType: ImageSaveType) {
		const extension = await validateAndGetExtension(image);

		const fileName = [randomBytes(40).toString('base64url'), extension].join(
			'.',
		);
		const filePath = this._resolvePath(fileName, saveType);

		// eslint-disable-next-line security/detect-non-literal-fs-filename
		await writeFile(filePath, image);
		return new this.Image(fileName, saveType, privateConstructorKey);
	}

	async makePermament() {
		const newImage = this.Image.create(
			await this.read(),
			ImageSaveType.PermanentImage,
		);
		await this.rm();
		return newImage;
	}
}
