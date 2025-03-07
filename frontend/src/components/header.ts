import {$} from '../$.js';

export function header(loggedIn: boolean) {
	return $`<header>
		<h1>
			<a href="/">Home</a>
		</h1>
		<a class="header-login" href="${loggedIn ? '/logout' : '/login'}">${loggedIn ? 'Logout' : 'Login'}</a>
	</header>`;
}
