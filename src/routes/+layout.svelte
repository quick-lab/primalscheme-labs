<script>
	import '@picocss/pico';
	import primalLogo from '$lib/assets/img/primal-logo.png';
	import gitHubLogo from '$lib/assets/img/github-mark.svg';
	import { base } from '$app/paths';
</script>

<nav data-sveltekit-reload>
	<ul>
		<li class="logo">
			<a href="{base}/">
				<img src={primalLogo} alt="triangle with all three sides equal" />
				<strong>PrimalSchemes</strong>
			</a>
		</li>
	</ul>
	<ul>
		<li><a href="{base}/">New Search</a></li>
		<li><a href="https://primalscheme.com">Create Scheme</a></li>
		<li><a href="{base}/faqs">FAQs</a></li>
		<li><a href="{base}/about">About</a></li>
	</ul>
</nav>

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
				style="height:22px!important;margin-left:3px;vertical-align:text-bottom;"
				src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"
			/><img
				style="height:22px!important;margin-left:3px;vertical-align:text-bottom;"
				src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"
			/><img
				style="height:22px!important;margin-left:3px;vertical-align:text-bottom;"
				src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1"
			/></a
		>
	</p>
</footer>

<style>
	li a {
		color: rgb(255, 254, 247);
	}
	li a:hover {
		color: rgb(255, 254, 247);
		text-decoration: underline;
	}
	li.logo a:hover {
		text-decoration: none;
	}
	.logo img {
		height: 70px;
		margin-right: 10px;
	}
	p {
		text-align: center;
	}
	nav {
		background-color: #00444d;
		color: white;
		margin-bottom: 20px;
	}
	nav ul {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0;
		margin: 0 20px;
	}
	footer {
		margin-top: 2em;
		border-top: 1px solid rgb(196, 196, 196);
		padding: 1em 0;
	}
	.gitlogo {
		height: 22px;
	}
</style>
