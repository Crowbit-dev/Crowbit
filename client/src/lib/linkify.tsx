import type { ReactNode } from 'react';

const URL_PATTERN = /(https?:\/\/[^\s<>"')\]]+)/g;

// Splits plain text on http(s) URLs so chat bodies render clickable links; everything else passes through untouched.
export function linkify(text: string, className?: string): ReactNode[] {
	const parts = text.split(URL_PATTERN);
	return parts.map((part, index) => {
		if (index % 2 === 0) return part;
		const trailing = part.match(/([.,!?;:]+)$/);
		const url = trailing ? part.slice(0, -trailing[1].length) : part;
		return (
			<span key={`${index}-${part}`}>
				<a href={url} target="_blank" rel="noreferrer" className={className}>
					{url}
				</a>
				{trailing?.[1] ?? ''}
			</span>
		);
	});
}
