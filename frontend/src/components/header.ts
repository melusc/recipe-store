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
		<h1>
			<a href="/">Home</a>
		</h1>
		<a class="header-login" href="${loggedIn ? '/logout' : '/login'}">${loggedIn ? 'Logout' : 'Login'}</a>
	</header>`;
}
