export function NotFound(){
    const root = document.querySelector('.root') as HTMLDivElement
    root.innerHTML= /*html*/`
        <h1>404 Not Found</h1>
        <p>Page not found</p>
    `;
}