import {$, type Substitution} from '../$.js';

export function centeredMain(children: Substitution) {
	return $`<main class="
		col-sm-10 col-md-6 col-lg-4
		align-self-center
		d-flex flex-column gap-3
	">
		${children}
	</main>`;
}
