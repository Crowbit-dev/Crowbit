import { Link } from 'react-router-dom';
import styles from './Auth.module.css';

// This is a draft privacy policy for the Crowbit app. It is not legal advice, and it may change before launch.
export default function Privacy() {
	return (
		<div className={styles.authPage}>
			<article className={styles.authDoc}>
				<h2>Privacy Policy</h2>
				<p className={styles.authDocStamp}>Last updated: October 2026</p>

				<h3>1. What we collect</h3>
				<p>
					<strong>Account data:</strong> email, username, password (hashed, never stored in plain text).
				</p>
				<p>
					<strong>Content you create:</strong> posts, replies, and direct messages, along with the audience you choose
					for each post (everyone or close friends) and your profile visibility (public or private).
				</p>
				<p>
					<strong>Preferences and local data:</strong> settings, notification choices, and accessibility options. Most
					of these live only in your browser's local storage on your own device; they are sent to our servers only where
					needed to operate your account.
				</p>
				<p>
					<strong>Operational data:</strong> IP address, device/browser type, and timestamps, collected for security,
					abuse prevention, and troubleshooting. This is not used to build an advertising profile.
				</p>
				<p>We do not use third-party trackers or advertising pixels.</p>

				<h3>2. Why we collect it</h3>
				<p>
					To create and secure your account, show content to the audience you chose, operate messaging, prevent abuse,
					and communicate with you about the service.
				</p>
				<p>
					Your feed is chronological by default and is not built from a behavioral profile. Marketing email is sent only
					with separate, revocable opt-in consent.
				</p>

				<h3>3. Visibility and messaging controls</h3>
				<p>
					We design visibility and messaging controls so that content is served only to the audience you selected —
					posts to everyone or close friends, profiles as public or private, and message requests limited to the
					audience you allow. Changing a post's audience, your profile visibility, or deleting content is reflected
					going forward from the moment you change it.
				</p>
				<p>
					Direct messages are visible only to the participants in the conversation. As social features such as
					following, friend requests, and block or mute lists launch, they will be governed by this same policy; until
					then, any such controls shown in the app are previews that do not yet filter content.
				</p>

				<h3>4. Sharing</h3>
				<p>
					We do not sell personal information, and we do not share it for cross-context behavioral advertising. Limited
					sharing happens only with:
				</p>
				<p>
					Infrastructure providers under contract (hosting, email delivery, and error monitoring), each bound to use
					your data only to provide that service to us; or when required by law, such as a valid legal order.
				</p>

				<h3>5. Retention, deletion, and security</h3>
				<p>
					We keep data only as long as needed for the purposes above. Deleting a post, message, or your account removes
					it from active service; residual copies in backups, if any, are purged on a rolling basis, except where we are
					legally required to retain limited records (such as security logs tied to abuse investigations).
				</p>
				<p>
					Data is encrypted in transit (TLS), and we apply reasonable administrative and technical safeguards
					appropriate to the sensitivity of the data involved, including hashed credentials that are never stored or
					logged in plain text.
				</p>

				<h3>6. Your rights</h3>
				<p>
					Wherever you live, you may request access to, correction of, deletion of, or a portable export of your
					personal information by contacting us at the address below. As self-service account tools for export and
					deletion launch in settings, you will be able to exercise these rights there directly. Exported data is
					provided in a structured, commonly-used, machine-readable format.
				</p>
				<p>
					If you are in the EU, UK, or a U.S. state with its own privacy law (including California), you have additional
					statutory rights under GDPR, UK GDPR, CCPA, or the applicable state law, including the right to object to
					processing, restrict processing, and appeal a denied request. We will not discriminate against you for
					exercising any of these rights.
				</p>

				<h3>7. Children</h3>
				<p>
					Crowbit is not directed at children under 13, and we do not knowingly collect personal information from them.
					If we learn that a child under 13 has provided us personal information, we will delete it.
				</p>

				<h3>8. Self-hosted instances</h3>
				<p>
					Crowbit's source code is open and AGPLv3-licensed, and others may run their own independent instances. This
					policy governs only the official, Crowbit-operated instance. An independently operated instance is responsible
					for its own data practices and privacy policy, and you should review that instance's policy before creating an
					account there.
				</p>

				<h3>9. Changes and contact</h3>
				<p>
					Material changes will be posted here with a new revision date. Questions about this policy, or requests
					relating to your data, can be sent to{' '}
					<a href="mailto:privacy@crowbit.dev" className={styles.authLink}>
						privacy@crowbit.dev
					</a>
					.
				</p>

				<p>
					<Link to="/signup" className={styles.authLink}>
						Back to sign up
					</Link>
				</p>
			</article>
		</div>
	);
}
