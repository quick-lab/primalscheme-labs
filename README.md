# primalscheme-labs

This is the code for the [labs.primalscheme.com](https://labs.primalscheme.com/) website. 

Please be aware this is under development and things are likely to change. 

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Playwright Integration Tests

Default mode (local preview web server managed by Playwright):

```bash
npm run test:integration
```

External mode (for restricted runners where binding localhost is blocked):

```bash
PLAYWRIGHT_BASE_URL=http://localhost:4173 npm run test:integration:external
```

Debug mode (verbose Playwright web server/API logs):

```bash
npm run test:integration:debug
```

Notes:
- `test:integration` starts `vite preview` on `http://127.0.0.1:4173` with fast-fail startup timeout.
- `test:integration:external` disables Playwright `webServer` and requires `PLAYWRIGHT_BASE_URL`.
- Preflight checks fail fast when external mode is enabled without `PLAYWRIGHT_BASE_URL`.
