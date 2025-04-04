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
import path from 'node:path';

import {validateImageType, type Recipe} from 'api';

import {imageUploadDirectory} from '../data.ts';

export type FormImage = {
	savedName: string | undefined;
	buffer: Buffer;
	extension: string;
};

function getOptionalField(name: string) {
	return (body: Record<string, unknown>) => {
		const value = body[name];
		if (typeof value !== 'string' || value.trim().length === 0) {
			return;
		}

		return value.trim();
	};
}

export const readForm = {
	tags(body: Record<string, unknown>): string[] {
		const noJsTags = body['tags-nojs'];
		if (typeof noJsTags === 'string') {
			return noJsTags
				.split(',')
				.map(tag => tag.trim())
				.filter(Boolean);
		}

		const jsTags = body['tags-js'];
		const tagsInput = body['tags-input'];

		if (jsTags) {
			const tags = Array.isArray(jsTags) ? jsTags : [jsTags];

			if (typeof tagsInput === 'string' && tagsInput.trim()) {
				tags.push(tagsInput.trim());
			}

			return tags.filter(
				(tag): tag is string => typeof tag === 'string' && !!tag.trim(),
			);
		}

		return [];
	},
	sections(body: Record<string, unknown>) {
		const noJsSections = body['nojs-sections'];

		if (typeof noJsSections === 'string') {
			return noJsSections
				.replaceAll(/\r\n?/g, '\n')
				.split(/\n{2,}/)
				.map(section => section.trim())
				.filter(Boolean);
		}

		const jsSections = body['js-sections-input'];
		if (jsSections) {
			const sections = Array.isArray(jsSections) ? jsSections : [jsSections];

			return sections.filter(
				(section): section is string =>
					typeof section === 'string' && !!section.trim(),
			);
		}

		return [];
	},
	checkImageHasChanged(body: Record<string, unknown>, recipe: Recipe): boolean {
		const uploadedImage = body['uploaded-image'];
		return uploadedImage !== recipe.image;
	},
	async image(
		body: Record<string, unknown>,
		file: Express.Multer.File | undefined,
	): Promise<FormImage | undefined> {
		if (body['remove-image'] === 'on') {
			return;
		}

		if (file && file.size > 0) {
			const extension = await validateImageType(file.buffer);
			if (extension) {
				return {
					savedName: undefined,
					buffer: file.buffer,
					extension,
				};
			}
		}

		const uploadedImage = body['uploaded-image'];

		if (typeof uploadedImage !== 'string' || !uploadedImage) {
			return;
		}

		const uploadedImageName = path.basename(uploadedImage);
		const uploadedImagePath = new URL(uploadedImageName, imageUploadDirectory);

		try {
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			const image = await readFile(uploadedImagePath);
			const extension = await validateImageType(image);

			if (extension) {
				return {
					savedName: uploadedImageName,
					buffer: image,
					extension,
				};
			}
		} catch {}

		return;
	},
	title(body: Record<string, unknown>) {
		const title = body['title'];
		if (typeof title !== 'string' || title.trim().length < 4) {
			throw new Error('Title is too short or missing.');
		}

		return title.trim();
	},
	source: getOptionalField('source'),
	duration: getOptionalField('duration'),
} as const;
