import type { ReactEventHandler } from 'react';
import { extractEmbeds } from '../lib/linkify';
import styles from './MessageEmbeds.module.css';

const hideBroken: ReactEventHandler<HTMLImageElement | HTMLVideoElement | HTMLAudioElement> = (e) => {
	e.currentTarget.style.display = 'none';
};

export default function MessageEmbeds({ text, limit = 3 }: { text: string; limit?: number }) {
	const embeds = extractEmbeds(text, limit);
	if (embeds.length === 0) return null;
	return (
		<div className={styles.embeds}>
			{embeds.map((embed) =>
				embed.kind === 'image' ? (
					<img
						key={embed.url}
						src={embed.url}
						alt="Embedded media"
						loading="lazy"
						referrerPolicy="no-referrer"
						onError={hideBroken}
						className={styles.image}
					/>
				) : embed.kind === 'video' ? (
					<video
						key={embed.url}
						src={embed.url}
						controls
						preload="metadata"
						playsInline
						onError={hideBroken}
						className={styles.video}
					/>
				) : (
					<audio
						key={embed.url}
						src={embed.url}
						controls
						preload="metadata"
						onError={hideBroken}
						className={styles.audio}
					/>
				),
			)}
		</div>
	);
}
