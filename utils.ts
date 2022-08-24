import fs from 'fs'
import JSON5 from 'json5'
export function getRoutes(): Route[] {
    let routes: Route[] = JSON5.parse(fs.readFileSync('./routes.jsonc', 'utf8'))
    routes = routes.map((r) => {
        if (!r.path.startsWith('/slashkit-test-')) {
            r.path = `/slashkit-test-${r.path}`
        }
        return r
    })
    return routes
}

export type Route = {
    path: string
    targetUrl: string
}
