/** @type {NodeListOf<HTMLTimeElement>} */
const timeElements = document.querySelectorAll('time[datetime]');

/**
 * @param {Date} date
 * @param {string | undefined} display
 */
function formatDateTime(date, display) {
	if (display === 'date') {
		return date.toLocaleDateString();
	}

	if (display === 'time') {
		return date.toLocaleTimeString();
	}

	return date.toLocaleString();
}

for (const timeElement of timeElements) {
	const date = new Date(timeElement.dateTime);

	timeElement.textContent = formatDateTime(
		date,
		timeElement.dataset['display'],
	);
}
