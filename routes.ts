import { Route } from './utils'

export const routes: Route[] = [
    // gitbook no longer works, problems with window.location.pathname that is obfuscated
    // {
    //     path: '/slashkit-test-gitbook',
    //     targetUrl: 'https://docs.gitbook.com',
    // },
    {
        path: '/slashkit-test-webflow',
        targetUrl: 'https://wafunda.webflow.io',
    },
    {
        path: '/slashkit-test-ghost',
        targetUrl: 'https://www.knulst.de',
    },
    // { path: '/square', targetUrl: '' },
    {
        path: '/slashkit-test-notaku',
        targetUrl: 'https://notakudocs-5654.notaku.site',
    },
    // { path: '/wordpress', targetUrl: '' },
    // TODO trailing slash is removed by next.js for framer, use a framer site that does not rely on it
    { path: '/slashkit-test-framer', targetUrl: 'https://blog.framer.wiki' },
    {
        path: '/slashkit-test-substack',
        targetUrl: 'https://luke.substack.com',
    },
    {
        path: '/slashkit-test-checkly',
        targetUrl: 'https://notaku.checklyhq.com',
    },
    {
        path: '/slashkit-test-notion',
        targetUrl:
            'https://brave-iberis-6ea.notion.site/Notaku-docs-d852b7be5f854d3d8531532f3c9b1511',
    },
    { path: '/slashkit-test-super.so', targetUrl: 'https://docs.super.so' },
    {
        path: '/slashkit-test-shopify-hydrogen',
        targetUrl: 'https://shopify.dev/custom-storefronts/hydrogen',
    },
]
