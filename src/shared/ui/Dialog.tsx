"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface DialogProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
}

export function Dialog({ open, onClose, children }: DialogProps) {
	const overlayRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
			onClick={(e) => {
				if (e.target === overlayRef.current) onClose();
			}}
		>
			<div className="w-full max-w-sm rounded-xl border border-[#1e1e2e] bg-[#111118] shadow-2xl">
				{children}
			</div>
		</div>
	);
}
