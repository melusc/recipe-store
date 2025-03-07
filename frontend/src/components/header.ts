import {$} from '../$.js';

export function header(loggedIn: boolean) {
	return $`
		<header class="p-3">
			<link rel="stylesheet" href="/static/css/header.css">

			<h2>
				<a href="/">Home</a>
			</h2>
			<h2>
				<a
					class="header-login"
					href="${loggedIn ? '/logout' : '/login'}"
				>
					${loggedIn ? 'Logout' : 'Login'}
				</a>
			</h2>
		</header>
	`;
}
