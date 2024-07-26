import Papa from 'papaparse';

class FileViewer {
	private rootSelector: string;
	private data: any[] = [];
	private filteredData: any[] = [];

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
				<select class='filter-column'></select>
				<input id="filterInput" class='filter-value' type="text" placeholder="Filter...">
				<div id="fileContent"></div>
			</form>
		`;

		const inputElement = document.querySelector('.arch') as HTMLInputElement;
		const filterValueElement = document.querySelector('.filter-value') as HTMLInputElement;
		const fileContentElement = document.getElementById('fileContent');

		inputElement.addEventListener('change', (event) => {
			event.preventDefault();
			this.handleFileChange(event, fileContentElement);
		});

		filterValueElement.addEventListener('input', (event) => {
			event.preventDefault();
			this.handleFilterChange(event, fileContentElement);
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

	private handleFilterChange(event: Event, fileContentElement: HTMLElement | null): void {
		const filterColumnElement = document.querySelector('.filter-column') as HTMLSelectElement;
		const filterValueElement = event.target as HTMLInputElement;
		const filterColumn = filterColumnElement.value;
		const filterValue = filterValueElement.value.toLowerCase();

		this.filteredData = this.data.filter(row =>
			String(row[filterColumn]).toLowerCase().includes(filterValue)
		);
		if (fileContentElement) {
			this.displayData(this.filteredData, fileContentElement);
		}
	}

	private parseCSV(content: string, fileContentElement: HTMLElement): void {
		Papa.parse(content, {
			header: true,
			complete: (result) => {
				this.data = result.data;
				this.filteredData = this.data;
				this.populateFilterOptions(result.meta.fields || []);
				this.displayData(this.data, fileContentElement);
			},
			error: (error: any) => {
				console.error('Error al parsear el CSV:', error);
			}
		});
	}

	private populateFilterOptions(fields: string[]): void {
		const filterColumnElement = document.querySelector('.filter-column') as HTMLSelectElement;
		filterColumnElement.innerHTML = ''; // Clear existing options

		fields.forEach(field => {
			const option = document.createElement('option');
			option.value = field;
			option.textContent = field;
			filterColumnElement.appendChild(option);
		});
	}

	private displayData(data: any[], fileContentElement: HTMLElement): void {
		const table = document.createElement('table');
		const headerRow = table.insertRow();

		const rowsPerPage = 15;
		let currentPage = 1;
		let totalPages = Math.ceil(data.length / rowsPerPage);

		if (data.length === 0) {
			fileContentElement.innerHTML = 'No matching records found';
			return;
		}

		let keys = Object.keys(data[0]);

		keys.forEach(key => {
			const th = document.createElement('th');
			th.textContent = key;
			headerRow.appendChild(th);
		});

		table.appendChild(headerRow);

		const createPage = (start: number, end: number) => {
			table.innerHTML = '';
			table.appendChild(headerRow.cloneNode(true));
			for (let i = start; i < end && i < data.length; i++) {
				const dataRow = table.insertRow();
				keys.forEach(key => {
					const cell = dataRow.insertCell();
					cell.textContent = data[i][key];
				});
			}
		};

		const start = (currentPage - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		createPage(start, end);

		const prevButton = document.createElement('button');
		prevButton.textContent = 'Prev';
		prevButton.addEventListener('click', (event) => {
			event.preventDefault();
			if (currentPage > 1) {
				currentPage--;
				updatePage();
			}
		});

		const nextButton = document.createElement('button');
		nextButton.textContent = 'Next';
		nextButton.addEventListener('click', (event) => {
			event.preventDefault();
			if (currentPage < totalPages) {
				currentPage++;
				updatePage();
			}
		});

		const paginationControls = document.createElement('div');
		paginationControls.appendChild(prevButton);
		paginationControls.appendChild(nextButton);

		fileContentElement.innerHTML = '';
		fileContentElement.appendChild(table);
		fileContentElement.appendChild(paginationControls);

		const updatePage = () => {
			const start = (currentPage - 1) * rowsPerPage;
			const end = start + rowsPerPage;
			createPage(start, end);
		};
	}
}

export default FileViewer;
