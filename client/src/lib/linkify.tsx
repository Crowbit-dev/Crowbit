import type { ReactNode } from 'react';

const URL_PATTERN = /(https?:\/\/[^\s<>"')\]]+)/g;
const TRAILING_PUNCT = /([.,!?;:]+)$/;

export type EmbedKind = 'image' | 'video' | 'audio';

export type MediaEmbed = {
	url: string;
	kind: EmbedKind;
};

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'ogv']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'oga']);

function cleanUrl(part: string): string {
	const trailing = part.match(TRAILING_PUNCT);
	return trailing ? part.slice(0, -trailing[1].length) : part;
}

function extensionOf(url: string): string {
	const path = url.split(/[?#]/)[0] ?? '';
	const dot = path.lastIndexOf('.');
	if (dot === -1) return '';
	return path.slice(dot + 1).toLowerCase();
}

export function extractEmbeds(text: string, limit = 3): MediaEmbed[] {
	const embeds: MediaEmbed[] = [];
	const seen = new Set<string>();
	for (const part of text.split(URL_PATTERN)) {
		if (embeds.length >= limit) break;
		const url = cleanUrl(part);
		if (!url.startsWith('http') || seen.has(url)) continue;
		const extension = extensionOf(url);
		const kind: EmbedKind | null = IMAGE_EXTENSIONS.has(extension)
			? 'image'
			: VIDEO_EXTENSIONS.has(extension)
				? 'video'
				: AUDIO_EXTENSIONS.has(extension)
					? 'audio'
					: null;
		if (!kind) continue;
		seen.add(url);
		embeds.push({ url, kind });
	}
	return embeds;
}

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
