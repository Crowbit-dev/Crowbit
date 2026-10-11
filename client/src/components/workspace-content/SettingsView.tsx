import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { currentUser } from '../../appData';
import { CHAT_TEXT_SIZES, MESSAGE_SPACINGS } from '../../lib/chatScales';
import { notifFilterLabels } from '../../lib/notifFilterLabels';
import type {
	MessageRequestsAudience,
	NotificationAudience,
	ProfileVisibility,
	SettingsCategory,
	SettingsPrefs,
} from '../../types';
import settingStyles from '../SettingControls.module.css';
import {
	SettingCheckbox,
	SettingEditableText,
	SettingRadioGroup,
	SettingRow,
	SettingSelect,
	SettingSlider,
	SettingToggle,
} from '../SettingControls';
import styles from '../WorkspaceContent.module.css';

type SettingsViewProps = {
	settingsCategory: SettingsCategory;
	settingsPrefs: SettingsPrefs;
	onUpdateSettings: <K extends keyof SettingsPrefs>(section: K, patch: Partial<SettingsPrefs[K]>) => void;
};

export default function SettingsView({ settingsCategory, settingsPrefs, onUpdateSettings }: SettingsViewProps) {
	const [highContrast, setHighContrast] = useState(false);
	return (
		<main className={styles.workspaceContent}>
			<section className={styles.panelStack}>
				{settingsCategory === 'account' && (
					<div>
						<h3 className={settingStyles.subHead}>Account info</h3>
						<SettingRow
							label="Display name"
							control={
								<SettingEditableText
									value={settingsPrefs.account.displayName}
									fallback={currentUser.displayName}
									onSave={(next) => onUpdateSettings('account', { displayName: next })}
									label="Display name"
								/>
							}
						/>
						<SettingRow
							label="Username"
							control={
								<SettingEditableText
									value={settingsPrefs.account.username}
									fallback={currentUser.username.replace(/^@+/, '')}
									prefix="@"
									onSave={(next) => onUpdateSettings('account', { username: next.replace(/^@+/, '') })}
									label="Username"
								/>
							}
						/>
						<SettingRow
							label="Email"
							copy="Used for sign-in and notifications."
							control={
								<SettingEditableText
									value={settingsPrefs.account.email}
									fallback={currentUser.email}
									onSave={(next) => onUpdateSettings('account', { email: next })}
									label="Email"
								/>
							}
						/>
						<h3 className={settingStyles.subHead}>Password &amp; security</h3>
						<SettingRow
							label="Two-factor authentication"
							control={
								<>
									{/* TEMPORARY: persisted in memory only until backend enforcement lands */}
									<SettingToggle
										checked={settingsPrefs.account.twoFactor}
										onChange={(next) => onUpdateSettings('account', { twoFactor: next })}
										label="Two-factor authentication"
									/>
								</>
							}
						/>
						<SettingRow
							label="Active sessions"
							control={
								<>
									{/* TEMPORARY: opens a device list once it exists */}
									<button type="button" className={settingStyles.plainButton} aria-label="View active sessions">
										1 session
										<ChevronRight size={14} aria-hidden="true" />
									</button>
								</>
							}
						/>
						<SettingRow
							label="Password"
							copy="yeah, no. password123 isn't going to cut it."
							control={
								<>
									{/* TEMPORARY: decorative until password change lands */}
									<button type="button" className={settingStyles.plainButton}>
										Change password
									</button>
								</>
							}
						/>
						<h3 className={settingStyles.subHead}>Danger zone</h3>
						<SettingRow
							label="Disable account"
							copy="Hide your profile until you come back."
							control={
								<>
									{/* TEMPORARY: decorative until account disabling lands */}
									<button type="button" className={settingStyles.plainButton}>
										Disable account
									</button>
								</>
							}
						/>
						<SettingRow
							label="Delete account"
							copy="Permanent. Your account and data are gone for good."
							control={
								<>
									{/* TEMPORARY: decorative until account deletion lands */}
									<button type="button" className={settingStyles.dangerButton}>
										Delete account
									</button>
								</>
							}
						/>
					</div>
				)}
				{settingsCategory === 'privacy' && (
					<div>
						<h3 className={settingStyles.subHead}>Visibility</h3>
						<SettingRow
							label="Profile visibility"
							control={
								<>
									{/* TEMPORARY: persisted in memory only until backend enforcement lands */}
									<SettingRadioGroup
										value={settingsPrefs.privacy.profileVisibility}
										onChange={(next) => onUpdateSettings('privacy', { profileVisibility: next as ProfileVisibility })}
										label="Profile visibility"
										options={[
											{ value: 'public', label: 'Public' },
											{ value: 'private', label: 'Private' },
										]}
									/>
								</>
							}
						/>
						<SettingRow
							label="Show read activity"
							control={
								<>
									{/* TEMPORARY: persisted in memory only until backend enforcement lands */}
									<SettingToggle
										checked={settingsPrefs.privacy.showReadActivity}
										onChange={(next) => onUpdateSettings('privacy', { showReadActivity: next })}
										label="Show read activity"
									/>
								</>
							}
						/>
						<SettingRow
							label="Close friends"
							copy="The audience for your close-friends-only posts."
							control={
								<>
									{/* TEMPORARY: decorative until close friends management lands */}
									<button type="button" className={settingStyles.plainButton}>
										Manage
									</button>
								</>
							}
						/>
						<SettingRow
							label="Show close friends badge"
							control={
								<SettingToggle
									checked={settingsPrefs.privacy.showCloseFriendsBadge}
									onChange={(next) => onUpdateSettings('privacy', { showCloseFriendsBadge: next })}
									label="Show close friends badge"
								/>
							}
						/>
						<h3 className={settingStyles.subHead}>Messaging</h3>
						<SettingRow
							label="Message requests"
							control={
								<>
									{/* TEMPORARY: persisted only until backend enforcement lands */}
									<SettingRadioGroup
										value={settingsPrefs.privacy.messageRequests}
										onChange={(next) =>
											onUpdateSettings('privacy', { messageRequests: next as MessageRequestsAudience })
										}
										label="Message requests"
										options={[
											{ value: 'everyone', label: 'Everyone' },
											{ value: 'followers', label: 'Followers' },
											{ value: 'none', label: 'No one' },
										]}
									/>
								</>
							}
						/>
						<SettingRow
							label="Read receipts"
							control={
								<>
									{/* TEMPORARY: persisted only until backend enforcement lands */}
									<SettingToggle
										checked={settingsPrefs.privacy.readReceipts}
										onChange={(next) => onUpdateSettings('privacy', { readReceipts: next })}
										label="Read receipts"
									/>
								</>
							}
						/>
						<SettingRow
							label="Typing indicators"
							control={
								<>
									{/* TEMPORARY: persisted only until backend enforcement lands */}
									<SettingToggle
										checked={settingsPrefs.privacy.typingIndicators}
										onChange={(next) => onUpdateSettings('privacy', { typingIndicators: next })}
										label="Typing indicators"
									/>
								</>
							}
						/>
						<h3 className={settingStyles.subHead}>Blocked users</h3>
						<SettingRow
							label="Block list"
							copy="Blocked people can't contact you or see your activity."
							control={
								<>
									{/* TEMPORARY: decorative until block list management lands */}
									<button type="button" className={settingStyles.plainButton}>
										Manage
									</button>
								</>
							}
						/>
					</div>
				)}
				{settingsCategory === 'notifications' && (
					<div>
						<h3 className={settingStyles.subHead}>Push notifications</h3>
						{(['friend_request', 'mention', 'like', 'reply', 'comment'] as const).map((kind) => (
							<SettingRow
								key={kind}
								label={notifFilterLabels[kind]}
								control={
									kind === 'friend_request' ? (
										<SettingToggle
											checked={settingsPrefs.notifications.friend_request}
											onChange={(next) => onUpdateSettings('notifications', { friend_request: next })}
											label={notifFilterLabels[kind]}
										/>
									) : (
										<SettingRadioGroup
											value={settingsPrefs.notifications[kind]}
											onChange={(next) => onUpdateSettings('notifications', { [kind]: next as NotificationAudience })}
											label={notifFilterLabels[kind]}
											options={[
												{ value: 'everyone', label: 'Everyone' },
												{ value: 'friends', label: 'Friends' },
												{ value: 'following', label: 'Profiles I follow' },
												{ value: 'off', label: 'Off' },
											]}
										/>
									)
								}
							/>
						))}
						<h3 className={settingStyles.subHead}>Mute notifications from people</h3>
						{/* TEMPORARY: persisted only in memory until follow-graph filtering lands */}
						<SettingRow
							label="You don't follow"
							control={
								<>
									<SettingCheckbox
										checked={settingsPrefs.mutedSenders.notFollowing}
										onChange={(next) => onUpdateSettings('mutedSenders', { notFollowing: next })}
										label="You don't follow"
									/>
								</>
							}
						/>
						<SettingRow
							label="Don't follow you"
							control={
								<>
									<SettingCheckbox
										checked={settingsPrefs.mutedSenders.notFollowedBy}
										onChange={(next) => onUpdateSettings('mutedSenders', { notFollowedBy: next })}
										label="Don't follow you"
									/>
								</>
							}
						/>
					</div>
				)}
				{settingsCategory === 'accessibility' && (
					<div>
						<h3 className={settingStyles.subHead}>Text readability</h3>
						<SettingRow
							label="Text size in chat"
							stacked
							control={
								<SettingSlider
									value={CHAT_TEXT_SIZES.indexOf(settingsPrefs.accessibility.chatTextSize)}
									min={0}
									max={CHAT_TEXT_SIZES.length - 1}
									onChange={(next) =>
										onUpdateSettings('accessibility', {
											chatTextSize: CHAT_TEXT_SIZES[next] ?? settingsPrefs.accessibility.chatTextSize,
										})
									}
									label="Text size in chat"
									ticks={CHAT_TEXT_SIZES.map((size) => `${size}px`)}
									highlightTick="15px"
								/>
							}
						/>
						<h3 className={settingStyles.subHead}>Visual density</h3>
						<SettingRow
							label="Space between message groups"
							stacked
							control={
								<SettingSlider
									value={MESSAGE_SPACINGS.indexOf(settingsPrefs.accessibility.messageSpacing)}
									min={0}
									max={MESSAGE_SPACINGS.length - 1}
									onChange={(next) =>
										onUpdateSettings('accessibility', {
											messageSpacing: MESSAGE_SPACINGS[next] ?? settingsPrefs.accessibility.messageSpacing,
										})
									}
									label="Space between message groups"
									ticks={MESSAGE_SPACINGS.map((space) => `${space}px`)}
									highlightTick="20px"
								/>
							}
						/>
						<SettingRow
							label="Compact density"
							control={
								<>
									{/* TEMPORARY: decorative until density scaling lands */}
									<SettingToggle
										checked={settingsPrefs.accessibility.compactDensity}
										onChange={(next) => onUpdateSettings('accessibility', { compactDensity: next })}
										label="Compact density"
									/>
								</>
							}
						/>
						<h3 className={settingStyles.subHead}>Color & contrast</h3>
						<SettingRow
							label="Saturation"
							stacked
							copy="Fades the interface only. Images, videos, and role colors stay as they are."
							control={
								<SettingSlider
									value={settingsPrefs.accessibility.saturation}
									min={0}
									max={100}
									step={10}
									onChange={(next) => onUpdateSettings('accessibility', { saturation: next })}
									label="Saturation"
									ticks={['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%']}
									highlightTick="100%"
								/>
							}
						/>
						<SettingRow
							label="High contrast mode"
							control={
								<>
									{/* TEMPORARY: decorative until high contrast theme lands */}
									<SettingToggle checked={highContrast} onChange={setHighContrast} label="High contrast mode" />
								</>
							}
						/>
						<h3 className={settingStyles.subHead}>Motion</h3>
						<SettingRow
							label="Reduce motion"
							control={
								<SettingToggle
									checked={settingsPrefs.accessibility.reduceMotion}
									onChange={(next) => onUpdateSettings('accessibility', { reduceMotion: next })}
									label="Reduce motion"
								/>
							}
						/>
					</div>
				)}
				{settingsCategory === 'voice' && (
					<div>
						<SettingRow
							label="Noise suppression"
							control={
								<>
									{/* TEMPORARY: persisted in memory only until voice wiring lands */}
									<SettingToggle
										checked={settingsPrefs.voice.noiseSuppression}
										onChange={(next) => onUpdateSettings('voice', { noiseSuppression: next })}
										label="Noise suppression"
									/>
								</>
							}
						/>
						<SettingRow
							label="Echo cancellation"
							control={
								<>
									{/* TEMPORARY: persisted in memory only until voice wiring lands */}
									<SettingToggle
										checked={settingsPrefs.voice.echoCancellation}
										onChange={(next) => onUpdateSettings('voice', { echoCancellation: next })}
										label="Echo cancellation"
									/>
								</>
							}
						/>
						<SettingRow
							label="Microphone"
							control={
								<>
									{/* TEMPORARY: options are placeholders */}
									<SettingSelect
										value={settingsPrefs.voice.microphone}
										onChange={(next) => onUpdateSettings('voice', { microphone: next })}
										label="Microphone"
										options={['Default', 'Built-in Microphone', 'USB Headset']}
									/>
								</>
							}
						/>
						<SettingRow
							label="Camera"
							control={
								<>
									{/* TEMPORARY: options are placeholders */}
									<SettingSelect
										value={settingsPrefs.voice.camera}
										onChange={(next) => onUpdateSettings('voice', { camera: next })}
										label="Camera"
										options={['Off', 'FaceTime HD Camera', 'USB Camera']}
									/>
								</>
							}
						/>
					</div>
				)}
				{settingsCategory === 'help' && (
					<div>
						<h3 className={settingStyles.subHead}>Open source</h3>
						<SettingRow
							label="Source code"
							copy="Crowbit is open source under the AGPLv3 license."
							control={
								<a
									href="https://github.com/crowbit-dev/crowbit"
									target="_blank"
									rel="noreferrer"
									className={settingStyles.plainButton}
								>
									<svg width={24} height={24} aria-hidden="true">
										<use href="/icons.svg#github-icon" />
									</svg>
									GitHub
								</a>
							}
						/>
						<SettingRow
							label="Report an issue"
							copy="Found a bug or have an idea? Tell us about it."
							control={
								<a
									href="https://github.com/crowbit-dev/crowbit/issues"
									target="_blank"
									rel="noreferrer"
									className={settingStyles.plainButton}
								>
									New issue
								</a>
							}
						/>
						<h3 className={settingStyles.subHead}>Support</h3>
						<SettingRow
							label="Keyboard shortcuts"
							copy="Move around Crowbit without touching the mouse."
							control={
								<>
									{/* TEMPORARY: decorative until the shortcuts dialog lands */}
									<button type="button" className={settingStyles.plainButton}>
										View shortcuts
									</button>
								</>
							}
						/>
					</div>
				)}
			</section>
		</main>
	);
}
