"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
	return (
		<SonnerToaster
			theme="dark"
			position="top-right"
			toastOptions={{
				classNames: {
					toast: "!bg-[#111118] !border-[#1e1e2e] !rounded-xl !text-zinc-200",
					title: "!text-xs !font-medium !text-zinc-200",
					description: "!text-xs !text-zinc-400",
					actionButton: "!bg-zinc-100 !text-zinc-900 !text-xs !font-medium hover:!bg-white",
					cancelButton: "!bg-zinc-800 !text-zinc-300 !text-xs hover:!bg-zinc-700",
				},
			}}
		/>
	);
}
