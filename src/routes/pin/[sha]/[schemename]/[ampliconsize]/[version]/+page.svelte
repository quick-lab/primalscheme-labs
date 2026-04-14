<script>
	import { page } from '$app/stores';
	import SchemeDetail from '$lib/components/SchemeDetail.svelte';
	import { GITHUB_RAW_URL, PRIMER_CLASS } from '$lib/config.js';

	$: ({ sha, schemename, ampliconsize, version } = $page.params);
	$: baseUrl = `${GITHUB_RAW_URL}/${sha}/${PRIMER_CLASS}/${schemename}/${ampliconsize}/${version}`;
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
