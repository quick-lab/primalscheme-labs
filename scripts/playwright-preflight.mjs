const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1';
const baseURL = process.env.PLAYWRIGHT_BASE_URL;

if (skipWebServer && !baseURL) {
	console.error('Playwright preflight failed: PLAYWRIGHT_SKIP_WEBSERVER=1 requires PLAYWRIGHT_BASE_URL.');
	console.error('Use an externally hosted app URL, for example:');
	console.error(
		'  PLAYWRIGHT_SKIP_WEBSERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:4173 npm run test:integration:external'
	);
	console.error('If local sockets are blocked in this runner, keep skip mode enabled and point to a reachable URL.');
	process.exit(1);
}

if (skipWebServer) {
	console.log(`Playwright preflight: external mode enabled (base URL: ${baseURL}).`);
} else {
	console.log('Playwright preflight: webServer mode enabled (local preview at http://127.0.0.1:4173).');
}
