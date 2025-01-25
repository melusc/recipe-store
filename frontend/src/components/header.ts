import {$} from '../$.js';
import {registerStyle} from '../styles.js';

registerStyle(
	'header',
	`
	header {
		display: flex;
		flex-direction: row;
		gap: 1em;
		width: 100%;1
	}

	.header-login {
		align-self: end;
	}
`,
);

export function header(loggedIn: boolean) {
	return $`<header>
		<a href="/">Home</a>
		<a class="header-login" href="${loggedIn ? '/logout' : '/login'}">${loggedIn ? 'Logout' : 'Login'}</a>
	</header`;
}
