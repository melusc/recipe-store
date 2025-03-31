import {$} from '../$.js';

export function passwordRequirements(required: boolean) {
	return $`
		<div class="alert alert-info">
			${
				!required &&
				$`<div>Leave password fields empty, if you don't want to change your password.</div>`
			}
			<div>New password must match the following criteria:</div>
			<ul>
				<li>Contains a special character</li>
				<li>Contains a number</li>
				<li>Contains a lowercase letter</li>
				<li>Contains an uppercase letter</li>
				<li>Is at least 10 characters long</li>
			</ul>
		</div>
	`;
}
