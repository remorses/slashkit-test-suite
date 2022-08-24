import { Server } from 'http'
import path from 'path'
import fs from 'fs'
import { Browser, chromium, Page } from 'playwright'
import { test, expect, afterAll, beforeAll } from 'vitest'
import { spawn } from 'child_process'
import { fetch } from 'undici'

import { getRoutes, LOCALLY } from '../utils'
let timeout = 1000 * 60 * 10

const base = LOCALLY
    ? `http://127.0.0.1:5066`
    : 'https://suite.preview.slashkit.app' // maybe use the production server later?

const routes = getRoutes()

beforeAll(() => {
    try {
        fs.rmdirSync(path.resolve(__dirname, `../screens/`), {
            recursive: true,
        })
        fs.rmdirSync(path.resolve(__dirname, `../logs/`), { recursive: true })
    } catch (e) {}
})
beforeAll(async () => {
    let n = 0
    while (n < 5) {
        try {
            await sleep(1000)
            console.log(`Waiting for server to start, attempt ${n}`)
            const resp = await fetch(`${base}/__check_health`)
            if (resp.ok) {
                console.log(`Server is up`)
                return
            }
        } catch (e) {}
        n++
    }
    throw new Error(`Server is not up, tried ${n} times`)
})

test(
    'test root path',
    async () => {
        await testUrl({ path: '/', base })
    },
    timeout,
)

for (let r of routes) {
    let basePath = r.path
    if (!basePath) {
        throw new Error(`Missing basePath for ${r}`)
    }
    test(
        `${basePath}`,
        async () => {
            await testUrl({ path: basePath, base })
        },
        timeout,
    )
}

test(
    'notaku client side navigation',
    async () => {
        await testUrl({
            path: '/slashkit-test-notaku?changing-path',
            base,
            async fn(page) {
                await Promise.all([
                    page.click(`text="Supported blocks"`),
                    page.waitForNavigation(),
                ])
            },
        })
    },
    timeout,
)

test(
    'super client side navigation',
    async () => {
        await testUrl({
            path: '/slashkit-test-super.so?changing-path',
            base,
            async fn(page) {
                await Promise.all([
                    page.click(`a#block-how-super-works`),
                    page.waitForNavigation(),
                ])
            },
        })
    },
    timeout,
)

// TODO run page twice to test scripts cache?
async function testUrl({ path: p = '', base, fn = (page: Page) => {} }) {
    console.log(`Testing ${base}${p}`)
    const page = await getPage()
    let errors = ''
    const onConsole = (msg) => {
        if (msg.type() === 'error') {
            const loc = msg.location()
            errors += `${loc.url}:${loc.lineNumber}:${
                loc.columnNumber
            } ${msg.text()}\n`
        }
    }
    page.on('console', onConsole)
    const onPageError = (msg) => {
        errors += 'Exception:' + msg + '\n'
    }
    page.on('pageerror', onPageError)

    try {
        console.log(`Waiting for load`)
        await Promise.all([
            page.goto(new URL(p, base).toString()),
            page.waitForEvent('load'),
        ])
        await page.waitForTimeout(400)
        const host = new URL(base).host
        const pageUrl = new URL(page.url())
        if (pageUrl.host !== host) {
            throw new Error(`Page host (${pageUrl.host}) is not ${host}`)
        }
        const u = new URL(p, base)
        // await page.pause()
        if (!pageUrl.pathname.startsWith(u.pathname)) {
            throw new Error(
                `Page path (${pageUrl.pathname}) does not start with ${u.pathname}`,
            )
        }
        if (pageUrl.pathname !== u.pathname) {
            console.warn(`Page path (${pageUrl.pathname}) is not ${u.pathname}`)
        }
        await sleep(80)

        if (fn) {
            await fn(page)
        }
        const name = p === '/' ? 'root' : p.replace(/\//g, '')
        await page.screenshot({
            quality: 20,
            path: screenshotPath('screen-' + name),
        })
        console.log(`Writing logs`)
        const logsDir = path.resolve(__dirname, `../logs/${name}.log`)
        await fs.promises.mkdir(path.dirname(logsDir), { recursive: true })
        await fs.promises.writeFile(logsDir, errors + '\n')
    } finally {
        page.off('console', onConsole)
        page.off('pageerror', onPageError)
    }
}

function screenshotPath(name: string) {
    const x = path.resolve(__dirname, `../screens/${name}.jpg`)
    fs.mkdirSync(path.dirname(x), { recursive: true })
    return x
}

// const xports = {}
// xports['x'] = ''
// const x = xports['x']

let browser: Browser
async function getBrowser() {
    if (!browser || !browser.isConnected()) {
        browser = await chromium.launch({
            headless: false,
        })
    }
    return browser
}

// process.on('exit', () => {
//     browser.close()
// })

let page: Page
async function getPage() {
    const browser = await getBrowser()
    if (!page || page.isClosed()) {
        page = await browser.newPage()
    }

    return page
}

function sleep(t) {
    return new Promise((resolve) => setTimeout(resolve, t))
}
