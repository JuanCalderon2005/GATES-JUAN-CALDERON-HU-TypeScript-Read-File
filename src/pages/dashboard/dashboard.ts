import { navigateTo } from "../../Router";

export function Dashboard() {
	const root = document.querySelector('.root') as HTMLDivElement;
	root.innerHTML = /*html*/`
	<div class="container">	
	<h1 class='title'>Welcome</h1>
		<form class="ff">
			<label class='arch2'for="arch1">Select a CSV file:</label>
			<input class="arch1" type="file" accept=".csv">
			<button type="submit">Upload</button>
		</form>
	</div>
	`;

	const formElement = root.querySelector('form') as HTMLFormElement;
	const inputElement = root.querySelector('.arch1') as HTMLInputElement;

	formElement.addEventListener('submit', (event) => {
		event.preventDefault();
		const file = inputElement.files ? inputElement.files[0] : null;
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			localStorage.setItem('csvContent', content);
			navigateTo('/home');
		};
		reader.readAsText(file);
	});
}
