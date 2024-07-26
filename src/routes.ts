import { Dashboard } from "./pages/dashboard";
import { Home } from "./pages/home";
import { NotFound } from "./pages/not-found";

export const routes = {
    Public: [
        { path: '/', page: Dashboard },
        {path:'/not-found', page: NotFound},
        { path: '/home', page: Home }

    ]
}