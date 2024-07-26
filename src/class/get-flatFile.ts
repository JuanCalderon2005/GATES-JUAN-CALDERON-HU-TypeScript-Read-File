import Papa from 'papaparse';
import { navigateTo } from '../Router';
import { RenderGrafic } from './render-grafic';

class FileViewer {
	private rootSelector: string;
	private data: any[] = [];
	private filteredData: any[] = [];
	private currentPage: number = 1;

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
				<div id="chart"></div>
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
			const dataGrafic = localStorage.getItem('filteredData') ? JSON.parse(localStorage.getItem('filteredData') || '[]') : [];
			const renderGrafif = new RenderGrafic();
			const countM = renderGrafif.countMunicipiosByDepartment(dataGrafic);
			const arrayDep=renderGrafif.separateDepartmentCounts(countM);

			localStorage.setItem('department', JSON.stringify(arrayDep.departments));
			localStorage.setItem('counts', JSON.stringify(arrayDep.counts));

			renderGrafif.getOptionchart1();
			renderGrafif.initchart();

			

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

		// Guardar los datos filtrados en localStorage
		localStorage.setItem('filteredData', JSON.stringify(this.filteredData));

		this.currentPage = 1; // Reset to the first page on filter change
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
				fileContentElement.innerHTML = 'Error parsing CSV file.';
			}
		});
	}

	private displayData(data: any[], fileContentElement: HTMLElement): void {
		const table = document.createElement('table');
		const headerRow = table.insertRow();

		const rowsPerPage = 15;
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

		const updatePage = () => {
			const start = (this.currentPage - 1) * rowsPerPage;
			const end = start + rowsPerPage;
			createPage(start, end);
			pageIndicator.textContent = `Page ${this.currentPage} of ${totalPages}`;
			prevButton.disabled = this.currentPage === 1;
			nextButton.disabled = this.currentPage === totalPages;
		};

		const start = (this.currentPage - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		createPage(start, end);

		const prevButton = document.createElement('button');
		prevButton.textContent = 'Prev';
		prevButton.disabled = this.currentPage === 1;
		prevButton.addEventListener('click', (event) => {
			event.preventDefault();
			if (this.currentPage > 1) {
				this.currentPage--;
				updatePage();
			}
		});

		const nextButton = document.createElement('button');
		nextButton.textContent = 'Next';
		nextButton.disabled = this.currentPage === totalPages;
		nextButton.addEventListener('click', (event) => {
			event.preventDefault();
			if (this.currentPage < totalPages) {
				this.currentPage++;
				updatePage();
			}
		});

		const pageIndicator = document.createElement('span');
		pageIndicator.textContent = `Page ${this.currentPage} of ${totalPages}`;

		const paginationControls = document.createElement('div');
		paginationControls.appendChild(prevButton);
		paginationControls.appendChild(pageIndicator);
		paginationControls.appendChild(nextButton);

		fileContentElement.innerHTML = '';
		fileContentElement.appendChild(table);
		fileContentElement.appendChild(paginationControls);
	}

	public saveStateToLocalStorage(): void {
		localStorage.setItem('data', JSON.stringify(this.data));
		const filterValueElement = document.querySelector('.filter-value') as HTMLInputElement;
		if (filterValueElement) {
			localStorage.setItem('filterValue', filterValueElement.value);
		}
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
				this.currentPage = 1; // Reset to the first page on load
			}
			if (fileContentElement) {
				this.displayData(this.filteredData, fileContentElement);
			}
		}
	}
}

export default FileViewer;
