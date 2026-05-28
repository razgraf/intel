"use client";

import { useWatchlistStore } from "@/entities/watchlist/model/store";
import { encodeWatchlist } from "@/features/watchlist-sync/lib/encode";
import { Dialog } from "@/shared/ui/Dialog";
import { Show, SignInButton, SignOutButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Check, Link, LogIn, LogOut, QrCode, Upload, UserPlus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface AccountDialogProps {
	open: boolean;
	onClose: () => void;
	onOpenQr: () => void;
	onOpenRestore: () => void;
}

export function AccountDialog({ open, onClose, onOpenQr, onOpenRestore }: AccountDialogProps) {
	const watchlistItems = useWatchlistStore((s) => s.items);
	const { user } = useUser();
	const [copied, setCopied] = useState(false);

	const exportUrl = useMemo(() => {
		if (typeof window === "undefined") return "";
		const payload = encodeWatchlist(watchlistItems);
		return `${window.location.origin}${window.location.pathname}?watchlist=${payload}`;
	}, [watchlistItems]);

	const handleExport = useCallback(() => {
		navigator.clipboard.writeText(exportUrl).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [exportUrl]);

	return (
		<Dialog open={open} onClose={onClose} className="max-w-2xl">
			<div className="flex items-center justify-between p-5 pb-0">
				<h2 className="text-sm font-semibold text-zinc-100">Account</h2>
				<button
					type="button"
					onClick={onClose}
					className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
					aria-label="Close"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1e1e2e]">
				{/* Left — anonymous export/import */}
				<section className="p-5 space-y-3">
					<div className="space-y-1">
						<h3 className="text-[12px] uppercase font-bold text-zinc-500">No account needed</h3>
						<p className="text-[12px] text-zinc-500">
							Export your watchlist as a URL or QR code. Save it anywhere — paste it back later to
							restore. No sign-in required.
						</p>
					</div>
					<div className="flex flex-col gap-2">
						<button
							type="button"
							onClick={handleExport}
							className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
						>
							{copied ? (
								<>
									<Check className="h-3.5 w-3.5 text-emerald-400" />
									Copied!
								</>
							) : (
								<>
									<Link className="h-3.5 w-3.5" />
									Copy URL
								</>
							)}
						</button>
						<button
							type="button"
							onClick={onOpenQr}
							className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
						>
							<QrCode className="h-3.5 w-3.5" />
							QR Code
						</button>
						<button
							type="button"
							onClick={onOpenRestore}
							className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
						>
							<Upload className="h-3.5 w-3.5" />
							Restore
						</button>
					</div>
				</section>

				{/* Right — sign in / register or signed-in panel */}
				<section className="p-5 space-y-3">
					<Show when="signed-out">
						<div className="space-y-1">
							<h3 className="text-[12px] uppercase font-bold text-zinc-500">Sign in</h3>
							<p className="text-[12px] text-zinc-500">
								Log in or register to keep your watchlist synced and always up to date — no manual
								exports, available from any device.
							</p>
						</div>
						<div className="flex flex-col gap-2">
							<SignInButton mode="modal">
								<button
									type="button"
									className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white transition-colors"
								>
									<LogIn className="h-3.5 w-3.5" />
									Sign in
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button
									type="button"
									className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
								>
									<UserPlus className="h-3.5 w-3.5" />
									Register
								</button>
							</SignUpButton>
						</div>
					</Show>

					<Show when="signed-in">
						<div className="space-y-1">
							<h3 className="text-[12px] uppercase font-bold text-zinc-500">Account</h3>
							<p className="text-[12px] text-zinc-500">
								Your watchlist is synced to your account — available from any device.
							</p>
						</div>
						<div className="flex flex-col gap-3">
							<div className="rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] p-3 space-y-1.5">
								<div className="flex items-center gap-1.5">
									<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
									<span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
										Connected
									</span>
								</div>
								<p className="text-xs text-zinc-200 truncate">
									{user?.primaryEmailAddress?.emailAddress ?? "—"}
								</p>
							</div>
							<SignOutButton>
								<button
									type="button"
									className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
								>
									<LogOut className="h-3.5 w-3.5" />
									Log out
								</button>
							</SignOutButton>
						</div>
					</Show>
				</section>
			</div>
		</Dialog>
	);
}
