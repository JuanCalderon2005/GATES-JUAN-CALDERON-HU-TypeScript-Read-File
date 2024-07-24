import { Router } from "./Router"

export function App(){
    const root = document.querySelector('.root') as HTMLDivElement

    if(!root){
        throw new Error('Root element not found')
    }

    Router()
}