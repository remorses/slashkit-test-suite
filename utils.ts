import fs from 'fs'
import path from 'path'
import JSON5 from 'json5'
import { routes } from './routes'

export const LOCALLY = !!process.env.LOCALLY
export function getRoutes(): Route[] {
    routes.map((r) => {
        if (!r.path.startsWith('/slashkit-test-')) {
            throw new Error(
                `Invalid route ${r.path}, must start with /slashkit-test-`,
            )
        }
        return r
    })
    return routes
}

export type Route = {
    path: string
    targetUrl: string
}
