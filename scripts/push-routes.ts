import { fetch } from 'undici'
import { getRoutes } from '../utils'

async function main() {
    const secret = process.env.SECRET || ''
    if (!secret) {
        throw new Error('SECRET is required')
    }
    console.log('Pushing routes to server')
    const resp = await fetch(
        'https://preview.notaku.so/api/push-suite-routes',
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
    const json = await resp.json()
    console.log(json)
}

main()
