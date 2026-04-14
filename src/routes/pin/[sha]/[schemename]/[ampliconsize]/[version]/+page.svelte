<script>
	import { page } from '$app/stores';
	import SchemeDetail from '$lib/components/SchemeDetail.svelte';

	$: ({ sha, schemename, ampliconsize, version } = $page.params);
	$: baseUrl = `https://raw.githubusercontent.com/quick-lab/primerschemes/${sha}/primerschemes/${schemename}/${ampliconsize}/${version}`;
</script>

{#key sha}
	<SchemeDetail
		{schemename}
		ampliconsize={Number.parseInt(ampliconsize)}
		schemeversion={version}
		infoJsonUrl="{baseUrl}/info.json"
		primerBedUrl="{baseUrl}/primer.bed"
		referenceFastaUrl="{baseUrl}/reference.fasta"
		commitSha={sha}
	/>
{/key}
