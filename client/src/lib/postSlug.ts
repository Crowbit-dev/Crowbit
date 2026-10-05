// LOCAL-ONLY: slug is fabricated; no backend route exists for it yet.
export function postSlug(author: string, title: string): string {
	return `${author}-${title}`
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}
