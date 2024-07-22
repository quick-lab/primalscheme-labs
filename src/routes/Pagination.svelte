<script>
	export let pageCount;
	export let pageNum;
	export let resultCount;
	export let pageSize;

	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	let updateURLPageNum = async (newPageNum) => {
		let uriSearchParams = new URLSearchParams($page.url.searchParams.toString());
		uriSearchParams.set(encodeURIComponent('pageNum'), encodeURIComponent(newPageNum));
		await goto(`${base}/?${uriSearchParams.toString()}`, {
			keepFocus: true
		});
	};
</script>

<nav data-sveltekit-reload>
	<p>Showing {pageSize} of {resultCount} results</p>
	<ul>
		{#each Array(pageCount) as _, i}
			<li>
				{#if i + 1 == pageNum}
					<button
						on:click={() => {
							updateURLPageNum(i + 1);
						}}>{i + 1}</button
					>
				{:else}
					<button
						class="outline"
						on:click={() => {
							updateURLPageNum(i + 1);
						}}>{i + 1}</button
					>
				{/if}
			</li>
		{/each}
	</ul>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	nav ul {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
		margin: 0 20px;
	}
	nav ul li {
		list-style: none;
		margin: 0 5px;
	}
</style>
