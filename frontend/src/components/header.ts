import {$} from '../$.js';

export function header(loggedIn: boolean) {
	return $`
		<header class="sticky-top bg-primary">
			<nav class="p-3 d-flex flex-row">
				<h2 class="fw-semibold">
					<a href="/">Home</a>
				</h2>
				<h3 class="fw-semibold ms-auto">
					<a
						class="header-login"
						href="${loggedIn ? '/logout' : '/login'}"
					>
						${loggedIn ? 'Logout' : 'Login'}
					</a>
				</h3>
			</nav>
		</header>
	`;
}
