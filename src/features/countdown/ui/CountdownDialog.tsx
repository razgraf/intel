"use client";

import { formatCountdownPreviewDate, parseCountdownInput } from "@/shared/lib/countdown";
import { Dialog } from "@/shared/ui/Dialog";
import { Calligraph } from "calligraph";
import { useEffect, useMemo, useRef, useState } from "react";

interface CountdownDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (payload: { title: string; rawInput: string; targetAt: Date }) => void;
	initialTitle?: string;
	initialValue?: string;
	title?: string;
}

export function CountdownDialog({
	open,
	onClose,
	onSave,
	initialTitle = "",
	initialValue = "",
	title = "Countdown",
}: CountdownDialogProps) {
	const [countdownTitle, setCountdownTitle] = useState(initialTitle);
	const [value, setValue] = useState(initialValue);
	const titleInputRef = useRef<HTMLInputElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!open) return;
		setCountdownTitle(initialTitle);
		setValue(initialValue);
	}, [initialTitle, initialValue, open]);

	useEffect(() => {
		if (!open) return;
		const frame = window.requestAnimationFrame(() => titleInputRef.current?.focus());
		return () => window.cancelAnimationFrame(frame);
	}, [open]);

	const parsed = useMemo(() => parseCountdownInput(value), [value]);
	const output = parsed
		? formatCountdownPreviewDate(parsed)
		: value.length > 0
			? "Unrecognized format"
			: formatCountdownPreviewDate(new Date());
	const hasError = value.length > 0 && !parsed;

	function handleSave() {
		if (!parsed) return;
		onSave({
			title: countdownTitle.trim(),
			rawInput: value.trim(),
			targetAt: parsed,
		});
	}

	return (
		<Dialog open={open} onClose={onClose}>
			<div className="p-4 space-y-4">
				<div className="space-y-1">
					<h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
					<p className="text-[11px] leading-tight text-zinc-500">
						Type any date or time and we&apos;ll infer it the same way as the reference demo.
					</p>
				</div>

				<div className="flex flex-col gap-3">
					<input
						ref={titleInputRef}
						type="text"
						className="w-full rounded-xl border border-[#2a2a37] bg-[#171720] px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-[#3a3a4a] placeholder:text-zinc-500"
						value={countdownTitle}
						onChange={(e) => setCountdownTitle(e.target.value)}
						placeholder="Optional title..."
					/>
					<input
						ref={inputRef}
						type="text"
						className="w-full rounded-xl border border-[#2a2a37] bg-[#171720] px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-[#3a3a4a] placeholder:text-zinc-500"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						placeholder="Type a date..."
					/>
					<div
						className={`rounded-xl border px-3 py-3 transition-colors ${
							hasError
								? "border-red-500/30 bg-red-500/10 text-red-300"
								: "border-[#252532] bg-[#14141c] text-zinc-100"
						}`}
					>
						<div className="mb-1 text-[11px] uppercase font-bold text-zinc-500">Parsed Output</div>
						<div className={`min-h-7  ${!value ? "text-zinc-500" : ""}`}>
							<Calligraph>{output}</Calligraph>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-end gap-2 pt-1">
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSave}
						disabled={!parsed}
						className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
					>
						Save
					</button>
				</div>
			</div>
		</Dialog>
	);
}
