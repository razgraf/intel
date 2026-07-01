"use client";

import { cn } from "@/lib/utils";
import { Dialog } from "@/shared/ui/Dialog";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description?: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
}

export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	destructive = false,
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onClose={onClose}>
			<div className="p-5 space-y-4">
				<div className="space-y-3">
					<h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
					{description && <p className="text-xs text-zinc-400">{description}</p>}
				</div>
				<div className="flex gap-2 justify-end">
					<button
						type="button"
						onClick={onClose}
						className="px-3 py-1.5 text-xs rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className={cn(
							"rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
							destructive
								? "bg-zinc-100 text-black hover:bg-white"
								: "bg-emerald-600 text-white hover:bg-emerald-500",
						)}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</Dialog>
	);
}
