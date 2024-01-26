<script>
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
	@import '$lib/assets/css/main.css';

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
