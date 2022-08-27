import { fetch } from 'undici'
import { getRoutes } from '../utils'

const isPreview = true // how to decide when doing dev and prod?

let base = (() => {
    if (process.env.LOCALLY) {
        return `http://localhost:7050`
    }
    if (isPreview) {
        return `https://preview.slashkit.io`
    }
    if (process.env.NODE_ENV === 'production') {
        return `https://preview.slashkit.io`
    }

    throw new Error('Unknown NODE_ENV')
})()

async function main() {
    const secret = process.env.TEST_SUITE_SECRET || ''
    if (!secret) {
        throw new Error('TEST_SUITE_SECRET is required')
    }
    console.log('Pushing routes to server')
    console.log(`Base: ${base}`)
    const resp = await fetch(`${base}/api/push-suite-routes`, {
        body: JSON.stringify({
            routes: getRoutes(),
        }),
        method: 'POST',
        headers: {
            secret,
            'content-type': 'application/json',
            accept: 'application/json',
        },
    })
    if (!resp.ok) {
        let text = ''
        try {
            text = await resp.text()
        } catch (e) {}

        throw new Error(`${resp.status}: ${text}`)
    }
    const json = await resp.json()
    console.log(json)
}

main()
