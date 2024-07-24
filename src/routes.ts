import { Home } from "./pages/home";
import { NotFound } from "./pages/not-found";

export const routes = {
    Public: [
        { path: '/', page: Home },
        {path:'/not-found', page: NotFound}
    ]
}