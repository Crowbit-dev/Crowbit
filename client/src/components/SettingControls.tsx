import { Check, Pencil } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import styles from './SettingControls.module.css';

export function SettingRow({ label, copy, control }: { label: string; copy?: string; control: ReactNode }) {
	return (
		<div className={styles.row}>
			<div className={styles.copy}>
				<strong>{label}</strong>
				{copy && <span>{copy}</span>}
			</div>
			{control}
		</div>
	);
}

export function SettingToggle({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (next: boolean) => void;
	label: string;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			className={`${styles.toggle} ${checked ? styles.on : ''}`}
			onClick={() => onChange(!checked)}
		>
			<span className={styles.knob} aria-hidden="true" />
		</button>
	);
}

export function SettingCheckbox({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (next: boolean) => void;
	label: string;
}) {
	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={checked}
			aria-label={label}
			className={`${styles.checkbox} ${checked ? styles.checked : ''}`}
			onClick={() => onChange(!checked)}
		>
			<Check size={14} aria-hidden="true" />
		</button>
	);
}

export function SettingSelect({
	value,
	onChange,
	label,
	options,
}: {
	value: string;
	onChange: (next: string) => void;
	label: string;
	options: string[];
}) {
	return (
		<select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className={styles.select}>
			{options.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
	);
}

export function SettingEditableText({
	value,
	fallback,
	prefix,
	onSave,
	label,
	maxLength = 32,
}: {
	value: string;
	fallback: string;
	prefix?: string;
	onSave: (next: string) => void;
	label: string;
	maxLength?: number;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value || fallback);
	const save = () => {
		onSave(draft.trim().slice(0, maxLength));
		setEditing(false);
	};
	if (!editing) {
		return (
			<span className={styles.editableRow}>
				<span className={styles.staticValue}>
					{prefix}
					{value || fallback}
				</span>
				<button
					type="button"
					className={styles.iconButton}
					aria-label={`Edit ${label.toLowerCase()}`}
					onClick={() => {
						setDraft(value || fallback);
						setEditing(true);
					}}
				>
					<Pencil size={14} aria-hidden="true" />
				</button>
			</span>
		);
	}
	return (
		<span className={styles.editableRow}>
			<input
				ref={(el) => {
					el?.focus();
					el?.setSelectionRange(el.value.length, el.value.length);
				}}
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						save();
					} else if (e.key === 'Escape') {
						setEditing(false);
					}
				}}
				aria-label={label}
				maxLength={maxLength}
				className={styles.textField}
			/>
			<button type="button" className={styles.plainButton} onClick={save}>
				Save
			</button>
			<button type="button" className={styles.plainButton} onClick={() => setEditing(false)}>
				Cancel
			</button>
		</span>
	);
}

export function SettingRadioGroup({
	value,
	onChange,
	label,
	options,
}: {
	value: string;
	onChange: (next: string) => void;
	label: string;
	options: Array<{ value: string; label: string }>;
}) {
	return (
		<div role="radiogroup" aria-label={label} className={styles.radioGroup}>
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					role="radio"
					aria-checked={value === option.value}
					className={`${styles.radio} ${value === option.value ? styles.selected : ''}`}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}
