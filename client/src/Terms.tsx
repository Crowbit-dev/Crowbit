import { Link } from 'react-router-dom';
import styles from './Auth.module.css';

export default function Terms() {
	return (
		<div className={styles.authPage}>
			<article className={styles.authDoc}>
				<h2>Terms of Service</h2>
				<p className={styles.authDocStamp}>Last updated: October 2026</p>

				<h3>1. Eligibility</h3>
				<p>
					Crowbit is available only to people who are at least 13 years old. By creating an account you represent that
					you meet this requirement and that the information you provide is accurate.
				</p>
				<p>Violating this section may result in content removal and account termination, as described in Section 5.</p>

				<h3>2. Your account</h3>
				<p>
					You are responsible for keeping your credentials confidential and for all activity under your account. Use a
					strong, unique password, never share it, and tell us right away if you suspect unauthorized access.
				</p>

				<h3>3. Acceptable use</h3>
				<p>You agree not to:</p>
				<p>
					Harass, threaten, or incite violence against others; post hate speech, unlawful content, or child sexual abuse
					material; impersonate another person or entity; send spam or unsolicited bulk messages; attempt to bypass a
					user's visibility or messaging settings; probe, scan, or disrupt the service's security; or scrape or access
					the platform through anything other than the interfaces and APIs we provide.
				</p>
				<p>
					Violating this section may result in content removal, account suspension, or termination, as described in
					Section 5.
				</p>

				<h3>4. Content and visibility</h3>
				<p>
					You keep ownership of what you post. By posting, you grant Crowbit a limited, non-exclusive, royalty-free
					license to host, store, and display that content for the purpose of operating the service — strictly in
					accordance with the audience you chose for it (everyone or close friends). We do not use your content to train
					AI models or share it with advertisers.
				</p>
				<p>
					We may remove content that violates these terms. We will make reasonable efforts to notify you when we do,
					unless doing so would interfere with a safety or legal investigation.
				</p>

				<h3>5. Termination</h3>
				<p>
					We may suspend or terminate accounts that violate these terms, with notice where practical. You may delete
					your account at any time — through settings once self-service deletion launches, or by contacting us until
					then; see our{' '}
					<Link to="/privacy" className={styles.authLink}>
						Privacy Policy
					</Link>{' '}
					for what happens to your data afterward.
				</p>

				<h3>6. Disclaimers and limits of liability</h3>
				<p>
					The service is provided "as is" and "as available," without warranties of any kind, express or implied,
					including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the
					service will be uninterrupted, error-free, or completely secure.
				</p>
				<p>
					To the maximum extent permitted by law, Crowbit's total liability for any claim arising from your use of the
					service is limited to the greater of (a) the amount you paid us in the 12 months before the claim, or (b) $100
					USD. We are not liable for indirect, incidental, or consequential damages.
				</p>

				<h3>7. Governing law</h3>
				<p>
					These terms are governed by the laws of the jurisdiction in which Crowbit is established, without regard to
					conflict-of-law principles, except where local law requires otherwise for your protection as a consumer.
				</p>

				<h3>8. Self-hosted instances</h3>
				<p>
					Crowbit's source code is released under the AGPLv3 license, and these terms apply only to the official,
					Crowbit-operated instance. If you use an independently operated instance, that operator's own terms apply to
					your use of it, not this document.
				</p>

				<h3>9. Changes</h3>
				<p>
					We will post updated terms here and note the revision date. Continued use of the service after a change takes
					effect means you accept the updated terms. Questions about these terms can be sent to{' '}
					<a href="mailto:legal@crowbit.dev" className={styles.authLink}>
						legal@crowbit.dev
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
