"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	className?: string;
}

const DURATION = 0.2;
const EXIT_DURATION = DURATION * 0.8;
const EASING: [number, number, number, number] = [0.23, 1, 0.32, 1]; // ease-out-quint

export function Dialog({ open, onClose, children, className }: DialogProps) {
	const shouldReduceMotion = useReducedMotion();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					initial={shouldReduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{
						duration: shouldReduceMotion ? 0 : EXIT_DURATION,
						ease: EASING,
					}}
					onClick={(e) => e.stopPropagation()}
					onPointerDown={(e) => e.stopPropagation()}
				>
					{/* Overlay */}
					<div
						className="absolute inset-0 bg-black/60"
						role="presentation"
						onClick={onClose}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") onClose();
						}}
					/>

					{/* Content */}
					<motion.div
						className={cn(
							"relative w-full max-w-sm rounded-xl border border-[#1e1e2e] bg-[#111118] shadow-2xl",
							className,
						)}
						initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						transition={{
							duration: shouldReduceMotion ? 0 : DURATION,
							ease: EASING,
						}}
						style={{ willChange: "transform, opacity" }}
					>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}
