## Slashkit test suite

[Slashkit](https://slashkit.io) is a tool to host any web page on a subdirectory of you domain instead of using a subdomain as your would normally do.
Hosting on a subdirectory has the main benefit of improved SEO and domain authority.

## Todos

-   [ ] Add `routes.json` with websites that need to work with Slashkit, deploy these to slashkit.io/suite/x every push, to update routes send request to `/api/suite-routes` with new json file and a secret token stored in Github Actions
-   [ ] Add playwright test that make sure the deployed sites work correctly, test every N days and on push
-   [ ] Add special workspace package `website-with-test-cases` site made just to test special cases (like what happens doing `window.location = x` instead of `window.location.href = x`), deploy this to vercel and add to the routes
