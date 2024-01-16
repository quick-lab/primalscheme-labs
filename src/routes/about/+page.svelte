<!-- FILEPATH: /Users/kentcg/primal-dir/src/routes/about/+page.svelte -->

<script>
	export let name = 'John Doe';
	export let age = 25;
</script>

<main>
	<h1>About</h1>
	<p>Central resources for primerschemes</p>
</main>

<style>
	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	p {
		font-size: 1.2rem;
		line-height: 1.5;
		margin-bottom: 1rem;
	}
</style>
