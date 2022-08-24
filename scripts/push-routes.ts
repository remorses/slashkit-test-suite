import { fetch } from 'undici'
import { getRoutes } from '../utils'

const isDev = true // how to decide when doing dev and prod?

async function main() {
    const secret = process.env.TEST_SUITE_SECRET || ''
    if (!secret) {
        throw new Error('SECRET is required')
    }
    console.log('Pushing routes to server')
    const resp = await fetch(
        `https://${isDev ? 'preview.' : ''}slashkit.io/api/push-suite-routes`,
        {
            body: JSON.stringify({
                routes: getRoutes(),
            }),
            headers: {
                secret,
                'content-type': 'application/json',
                accept: 'application/json',
            },
        },
    )
    if (!resp.ok) {
        throw new Error(`${resp.status} ${resp.statusText}`)
    }
    const json = await resp.json()
    console.log(json)
}

main()
