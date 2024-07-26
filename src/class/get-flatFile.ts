import Papa from 'papaparse';
import { navigateTo } from '../Router';

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
			<button class="deleteFile">Delete File</button>	
			<form>
				<input id="filterInput" class="filter-value" type="text" placeholder="Filter...">
				<div id="fileContent"></div>
			</form>
		`;

		const filterValueElement = document.querySelector('.filter-value') as HTMLInputElement;
		const fileContentElement = document.getElementById('fileContent');

		const deleteFileButton = document.querySelector('.deleteFile') as HTMLButtonElement;
		deleteFileButton.addEventListener('click', () => {
			localStorage.removeItem('data');
			localStorage.removeItem('csvContent');
			localStorage.removeItem('filterValue');
			navigateTo('/');
		});

		

		filterValueElement.addEventListener('input', (event) => {
			event.preventDefault();
			this.handleFilterChange(event, fileContentElement);
		});

		this.loadDataFromLocalStorage(fileContentElement);
	}

	private handleFilterChange(event: Event, fileContentElement: HTMLElement | null): void {
		const filterValueElement = event.target as HTMLInputElement;
		const filterValue = filterValueElement.value.toLowerCase();

		this.filteredData = this.data.filter(row => 
			Object.values(row).some(value => 
				String(value).toLowerCase().includes(filterValue)
			)
		);
		if (fileContentElement) {
			this.displayData(this.filteredData, fileContentElement);
		}

		this.saveStateToLocalStorage();
	}

	private parseCSV(content: string, fileContentElement: HTMLElement): void {
		Papa.parse(content, {
			header: true,
			complete: (result) => {
				this.data = result.data;
				this.filteredData = this.data;
				this.displayData(this.data, fileContentElement);
				this.saveStateToLocalStorage();
			},
			error: (error: any) => {
				console.error('Error parsing CSV:', error);
			}
		});
	}

	private displayData(data: any[], fileContentElement: HTMLElement): void {
		const table = document.createElement('table');
		const headerRow = table.insertRow();

		const rowsPerPage = 15;
		let currentPage = 1;
		const totalPages = Math.ceil(data.length / rowsPerPage);

		if (data.length === 0) {
			fileContentElement.innerHTML = 'No matching records found';
			return;
		}

		const keys = Object.keys(data[0]);

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
		prevButton.disabled = currentPage === 1;
		prevButton.addEventListener('click', (event) => {
			event.preventDefault();
			if (currentPage > 1) {
				currentPage--;
				updatePage();
			}
		});

		const nextButton = document.createElement('button');
		nextButton.textContent = 'Next';
		nextButton.disabled = currentPage === totalPages;
		nextButton.addEventListener('click', (event) => {
			event.preventDefault();
			if (currentPage < totalPages) {
				currentPage++;
				updatePage();
			}
		});

		const pageIndicator = document.createElement('span');
		pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;

		const paginationControls = document.createElement('div');
		paginationControls.appendChild(prevButton);
		paginationControls.appendChild(pageIndicator);
		paginationControls.appendChild(nextButton);

		fileContentElement.innerHTML = '';
		fileContentElement.appendChild(table);
		fileContentElement.appendChild(paginationControls);

		const updatePage = () => {
			const start = (currentPage - 1) * rowsPerPage;
			const end = start + rowsPerPage;
			createPage(start, end);
			pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
			prevButton.disabled = currentPage === 1;
			nextButton.disabled = currentPage === totalPages;
		};
	}

	public saveStateToLocalStorage(): void {
        localStorage.setItem('data', JSON.stringify(this.data));
    }

	private loadDataFromLocalStorage(fileContentElement: HTMLElement | null): void {
		const storedContent = localStorage.getItem('csvContent');
		const storedFilterValue = localStorage.getItem('filterValue');

		if (storedContent) {
			this.parseCSV(storedContent, fileContentElement as HTMLElement);

			if (storedFilterValue) {
				const filterValueElement = document.querySelector('.filter-value') as HTMLInputElement;
				filterValueElement.value = storedFilterValue;
				this.filteredData = this.data.filter(row => 
					Object.values(row).some(value => 
						String(value).toLowerCase().includes(storedFilterValue.toLowerCase())
					)
				);
			}
			if (fileContentElement) {
				this.displayData(this.filteredData, fileContentElement);
			}
		}
	}
}

export default FileViewer;
