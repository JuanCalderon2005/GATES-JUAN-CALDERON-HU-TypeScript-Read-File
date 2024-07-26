import Papa from 'papaparse';

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
			const content = e.target?.result as string;
			if (fileContentElement && content) {
				this.parseCSV(content, fileContentElement);
			}
		};
		reader.readAsText(file);
	}

	private parseCSV(content: string, fileContentElement: HTMLElement): void {
		Papa.parse(content, {
			header: true,
			complete: (result) => {
				this.displayData(result.data, fileContentElement);
			},
			error: (error: any) => {
				console.error('Error al parsear el CSV:', error);
			}
		});
	}

	private displayData(data: any[], fileContentElement: HTMLElement): void {
		const table = document.createElement('table');
		const headerRow = table.insertRow();
	
		const keys = Object.keys(data[0]);
		keys.forEach(key => {
			const th = document.createElement('th');
			th.textContent = key;
			headerRow.appendChild(th);
		});
	
		data.forEach(row => {
			const dataRow = table.insertRow();
			keys.forEach(key => {
				const cell = dataRow.insertCell();
				cell.textContent = row[key];
			});
		});
	
		fileContentElement.innerHTML = '';
		fileContentElement.appendChild(table);
	}

	
}

export default FileViewer;
