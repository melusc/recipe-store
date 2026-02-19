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

import {Buffer} from 'node:buffer';
import {readFile} from 'node:fs/promises';

import {describe, expect} from 'vitest';

import {ImageSaveType} from '../src/api/image.js';
import {ApiError} from '../src/index.js';

import {apiTest, sampleImagePaths} from './utilities.js';

describe('Image', () => {
	apiTest.for<[string, URL]>([
		['jpg', sampleImagePaths.jpg],
		['png', sampleImagePaths.png],
		['webp', sampleImagePaths.webp],
	])(
		'Saving and reading images permanently (%s)',
		async ([extension, imagePath], {api: {Image}}) => {
			const imageBuffer = await readFile(imagePath);
			const image = await Image.create(
				imageBuffer,
				ImageSaveType.PermanentImage,
			);

			expect(image.name).match(new RegExp(String.raw`\.${extension}$`));

			const secondImage = await Image.fromName(image.name);
			expect(secondImage).toBeDefined();
			expect(secondImage!.isPermanent()).toStrictEqual(true);
		},
	);

	apiTest('Saving invalid image (gif)', async ({api: {Image}}) => {
		const imageBuffer = await readFile(sampleImagePaths.gif);
		await expect(
			Image.create(imageBuffer, ImageSaveType.PermanentImage),
		).rejects.toThrow();
	});

	apiTest.for<[string, URL]>([
		['jpg', sampleImagePaths.jpg],
		['png', sampleImagePaths.png],
		['webp', sampleImagePaths.webp],
	])(
		'Making temporary image permanent (%s)',
		async ([extension, imagePath], {api: {Image}}) => {
			const imageBuffer = await readFile(imagePath);
			const image = await Image.create(
				imageBuffer,
				ImageSaveType.TemporaryImage,
			);

			expect(image.name).match(new RegExp(String.raw`\.${extension}$`));

			const permanentImage = await image.makePermament();

			expect(permanentImage.name).match(
				new RegExp(String.raw`\.${extension}$`),
			);

			await expect(image.read()).rejects.toThrow();
		},
	);

	apiTest('Rejects too large images', async ({api: {Image}}) => {
		let buffer = await readFile(sampleImagePaths.png);

		// This keeps it a valid png per `file-type`
		// as headers are unchanged
		while (buffer.byteLength < 11e6) {
			buffer = Buffer.concat([buffer, buffer]);
		}

		await expect(
			Image.create(buffer, ImageSaveType.PermanentImage),
		).rejects.throw(ApiError, /large/);
	});

	apiTest('Removing EXIF', async ({api: {Image}}) => {
		const buffer = await readFile(sampleImagePaths.jpg);

		const exifRemoved = await Image.create(
			buffer,
			ImageSaveType.PermanentImage,
		);
		const exifUnchanged = await Image.create(
			buffer,
			ImageSaveType.PermanentImage,
			{removeExif: false},
		);

		const exifRemovedBuffer = await exifRemoved.read();
		const exifUnchangedBuffer = await exifUnchanged.read();

		expect(exifRemovedBuffer.byteLength).toBeLessThan(
			exifUnchangedBuffer.byteLength,
		);
	});
});
