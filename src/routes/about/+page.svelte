<script>
	import { base } from '$app/paths';
</script>

<main>
	<section>
		<hgroup>
			<h1>About</h1>
			<p>About primalscheme labs</p>
		</hgroup>

		<article>
			<header>
				<nav>
					<li><strong>What is primalscheme labs?</strong></li>
				</nav>
			</header>
			<p>
				The number of primerschemes is increasing rapidly, so we have built primalscheme labs to make
				it easier to find schemes and track their status. You can request that your scheme be tracked
				to enable other users to see it.
			</p>
			<p>
				The coloured status bar will indicate the development state of the scheme (see <a
					href="{base}/faqs">FAQ</a
				> for more information). Clicking on a scheme displays several new plots, scheme details, BED file
				and the reference(s). If you are logged in you can comment and engage with other users using Github
				Discussions.
			</p>
		</article>
	</section>
</main>

<style>
	article header {
		background-color: var(--pico-primary);
		color: rgb(255, 254, 247);
	}
</style>
