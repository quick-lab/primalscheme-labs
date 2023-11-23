export function load({ url }) {

    let query = url.searchParams.get('q') || '';
    let pageNum = url.searchParams.get('pageNum') || 1;

	return {
		query,
        pageNum
	};
}