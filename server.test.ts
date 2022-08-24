import { Server } from 'http'
import path from 'path'
import fs from 'fs'
import JSON5 from 'json5'
import { Browser, chromium, Page } from 'playwright'
import { test, expect, afterAll, beforeAll } from 'vitest'
import { spawn } from 'child_process'
import { fetch } from 'undici'

import { shell } from '@xmorse/deployment-utils/src'
import { getRoutes } from './utils'

const base = process.env.LOCALLY
    ? `http://127.0.0.1:5066`
    : 'https://suite.preview.slashkit.app' // maybe use the production server later?

const routes = getRoutes()

test(
    'test',
    async () => {
        try {
            await testUrl({ path: '/', base })
            for (let r of routes) {
                let basePath = r.path
                if (!basePath) {
                    throw new Error(`Missing basePath for ${r}`)
                }
                await testUrl({ path: basePath, base })
            }
            await testUrl({
                path: '/notaku?changing-path',
                base,
                async fn(page) {
                    await Promise.all([
                        page.click(`text="Supported blocks"`),
                        page.waitForNavigation(),
                    ])
                },
            })
            await testUrl({
                path: '/super',
                base,
                async fn(page) {
                    await Promise.all([
                        page.click(`a#block-how-super-works`),
                        page.waitForNavigation(),
                    ])
                },
            })
            // await testUrl({ path: '/with-redirection', base })
            // await sleep(1000 * 100)
        } finally {
        }
    },
    1000 * 60 * 10,
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
