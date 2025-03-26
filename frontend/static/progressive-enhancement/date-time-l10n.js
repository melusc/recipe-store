/** @type {NodeListOf<HTMLTimeElement>} */
const timeElements = document.querySelectorAll('time[datetime]');

for (const timeElement of timeElements) {
	timeElement.textContent = new Date(timeElement.dateTime).toLocaleDateString();
}
