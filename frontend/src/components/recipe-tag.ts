import {makeSlug} from '@lusc/util/slug';

import {$} from '../$.js';

export function recipeTag(tagName: string) {
	const slug = makeSlug(tagName, {appendRandomHex: false});

	return $`<a href="/tag/${slug}" class="badge text-bg-primary">
		${tagName}
	</a>`;
}

export function recipeTagList(tags: readonly string[]) {
	return $`<p class="d-flex flex-wrap gap-2">
		${tags.map(tag => recipeTag(tag))}
	</p>`;
}
