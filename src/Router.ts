import { routes } from "./routes.ts";

export function Router(){
    const path = window.location.pathname

    const publicRoutes = routes.Public.find(route => route.path === path)

    if(publicRoutes){
        if(path === '/home' && !localStorage.getItem('csvContent')){
            navigateTo('/')
            return
        }
    }

    if(publicRoutes){
        publicRoutes.page()
        return
    }

    navigateTo('/not-found')

}

export function navigateTo(path: string){
    window.history.pushState({},"",window.location.origin+path);
    Router();
}

