const defaultLocalBaseUrl = 'http://127.0.0.1:4173';
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1';

if (skipWebServer && !process.env.PLAYWRIGHT_BASE_URL) {
	throw new Error(
		'PLAYWRIGHT_SKIP_WEBSERVER=1 requires PLAYWRIGHT_BASE_URL. ' +
			'Example: PLAYWRIGHT_SKIP_WEBSERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:4173 npm run test:integration:external'
	);
}

const baseURL = skipWebServer ? process.env.PLAYWRIGHT_BASE_URL : defaultLocalBaseUrl;

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		baseURL
	},
	webServer: skipWebServer
		? undefined
		: {
				command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
				url: defaultLocalBaseUrl,
				timeout: 30000,
				reuseExistingServer: !process.env.CI,
				stdout: 'pipe',
				stderr: 'pipe'
		  }
};

export default config;
