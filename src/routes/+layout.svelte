<script>
	import '@picocss/pico';
	import primalLogo from '$lib/assets/img/primal-logo.png';
	import gitHubLogo from '$lib/assets/img/github-mark.svg';
	import { base } from '$app/paths';
</script>

<header class="is-fixed-above-lg is-fixed">
	<div class="container">
		<a class="logo" href="{base}/">
			<img src={primalLogo} alt="triangle with all three sides equal" />
			<strong>primalscheme lab</strong>
		</a>
		<nav class="navbar" data-sveltekit-reload>
			<ul>
				<li><a href="{base}/">New Search</a></li>

				<li><a href="{base}/faqs">FAQs</a></li>
				<li><a href="{base}/about">About</a></li>
				<li>
					<a href="https://primalscheme.com" role="button">Create Scheme</a>
				</li>
			</ul>
		</nav>
	</div>
</header>

<main class="container"><slot /></main>

<footer>
	<p>
		PrimalSchemes is a project by <a href="https://artic.network">ARTIC Network</a> and Quick Lab
		<a href="https://github.com/quick-lab"
			><img class="gitlogo" src={gitHubLogo} alt="Github logo" /></a
		>
	</p>

	<p xmlns:cc="http://creativecommons.org/ns#">
		Unless stated otherwise all work is licensed under <a
			href="http://creativecommons.org/licenses/by-sa/4.0/?ref=chooser-v1"
			target="_blank"
			rel="license noopener noreferrer"
			style="display:inline-block;"
			>CC BY-SA 4.0<img
				alt="Creative Commons Logo"
				style="height:22px!important;margin-left:3px;vertical-align:text-bottom;"
				src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"
			/><img
				alt="Creative Commons Logo"
				style="height:22px!important;margin-left:3px;vertical-align:text-bottom;"
				src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"
			/><img
				alt="Creative Commons Logo"
				style="height:22px!important;margin-left:3px;vertical-align:text-bottom;"
				src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1"
			/></a
		>
	</p>
</footer>

<style>
	:global(:root) {
		--pico-font-size: 90%;
		--pico-nav-link-spacing-horizontal: 1rem;
	}

	/* Slate color for light color scheme (Default) */
	/* Can be forced with data-theme="light" */
	:global([data-theme='light'], :root:not([data-theme='dark'])) {
		--pico-text-selection-color: rgba(129, 145, 181, 0.25);
		--pico-primary: #5d6b89;
		--pico-primary-background: #525f7a;
		--pico-primary-underline: rgba(93, 107, 137, 0.5);
		--pico-primary-hover: #48536b;
		--pico-primary-hover-background: #48536b;
		--pico-primary-focus: rgba(129, 145, 181, 0.5);
		--pico-primary-inverse: #fff;
	}

	/* Slate color for dark color scheme (Auto) */
	/* Automatically enabled if user has Dark mode enabled */
	@media only screen and (prefers-color-scheme: dark) {
		:global(:root:not([data-theme])) {
			--pico-text-selection-color: rgba(144, 158, 190, 0.1875);
			--pico-primary: #909ebe;
			--pico-primary-background: #525f7a;
			--pico-primary-underline: rgba(144, 158, 190, 0.5);
			--pico-primary-hover: #b0b9d0;
			--pico-primary-hover-background: #5d6b89;
			--pico-primary-focus: rgba(144, 158, 190, 0.375);
			--pico-primary-inverse: #fff;
		}
	}

	/* Slate color for dark color scheme (Forced) */
	/* Enabled if forced with data-theme="dark" */
	:global([data-theme='dark']) {
		--pico-text-selection-color: rgba(144, 158, 190, 0.1875);
		--pico-primary: #909ebe;
		--pico-primary-background: #525f7a;
		--pico-primary-underline: rgba(144, 158, 190, 0.5);
		--pico-primary-hover: #b0b9d0;
		--pico-primary-hover-background: #5d6b89;
		--pico-primary-focus: rgba(144, 158, 190, 0.375);
		--pico-primary-inverse: #fff;
	}

	:global(html) {
		overflow-x: hidden;
		scroll-behavior: smooth;
	}

	:global(html body) {
		display: grid;
		grid-template-rows: auto 1fr auto;
		align-items: start;
		min-height: 100vh;
	}

	@media (min-width: 1024px) {
		header.is-fixed-above-lg {
			z-index: 2;
			position: sticky;
			top: 0;
			-webkit-backdrop-filter: blur(1rem);
			backdrop-filter: blur(1rem);
			background-color: var(--pico-header-background);
			transition: border-top-color 0.4s ease-in-out, box-shadow 0.4s ease-in-out;
		}
		header.is-fixed-above-lg.is-fixed {
			border-bottom-color: var(--pico-header-border-color);
			box-shadow: var(--pico-card-box-shadow);
		}
	}
	header {
		z-index: 4;
		position: relative;
		padding: 0.5rem 0;
		border-bottom: var(--pico-border-width) solid transparent;
		margin-bottom: calc(var(--pico-block-spacing-vertical) * 2);
	}

	header .container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	header .container > a {
		margin: calc(var(--pico-spacing) * -0.125) calc(var(--pico-spacing) * -0.25);
		padding: calc(var(--pico-spacing) * 0.125) calc(var(--pico-spacing) * 0.25);
		border-radius: var(--pico-border-radius);
	}

	.logo img {
		height: 50px;
		margin-right: 10px;
	}

	a.logo {
		text-decoration: none;
		font-size: 1.2rem;
	}
	a.logo:hover {
		text-decoration: none;
	}
	footer {
		text-align: center;
		margin-top: 2em;
		border-top: 1px solid rgb(196, 196, 196);
		padding: 1em 0;
	}
	.gitlogo {
		height: 22px;
	}
</style>
