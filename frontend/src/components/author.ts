import type {User} from 'api';

import {$} from '../$.js';

export function smallAuthor(author: InstanceType<User> | undefined) {
	return $`
		<div class="author-small">
			${
				author
					? $`<a href="/users/${String(author.userId)}">${author.username}</a>`
					: $`<span>Deleted User</span>`
			}
		</div>
	`;
}
