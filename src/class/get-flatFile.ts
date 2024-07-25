
class FileViewer {
	private rootSelector: string;

	constructor(rootSelector: string) {
		this.rootSelector = rootSelector;
		this.initialize();
	}

	private initialize(): void {
		const root = document.querySelector(this.rootSelector) as HTMLDivElement;
		if (!root) return;

		root.innerHTML = /*html*/`
			<form>
				<label>Upload CSV</label>
				<input class='arch' type="file" accept=".csv">
				<div id="fileContent"></div> <!-- Elemento para mostrar el contenido -->
			</form>
		`;

		const inputElement = document.querySelector('.arch') as HTMLInputElement;
		const fileContentElement = document.getElementById('fileContent');

		inputElement.addEventListener('change', (event) => {
			this.handleFileChange(event, fileContentElement);
		});
	}

	private handleFileChange(event: Event, fileContentElement: HTMLElement | null): void {
		const input = event.target as HTMLInputElement;
		const file = input.files ? input.files[0] : null;
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result;
			if (fileContentElement && content) {
				fileContentElement.textContent = content.toString();
			}
		};
		reader.readAsText(file);
	}
}

export default FileViewer;