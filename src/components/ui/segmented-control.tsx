"use client";

import { cn } from "@/lib/utils";

type SegmentedControlOption<T extends string> = {
	label: string;
	value: T;
};

interface SegmentedControlProps<T extends string> {
	options: SegmentedControlOption<T>[];
	value: T;
	onChange: (value: T) => void;
	className?: string;
	size?: "sm" | "md";
}

export function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	className,
	size = "sm",
}: SegmentedControlProps<T>) {
	return (
		<div
			role="group"
			className={cn(
				"flex w-fit flex-wrap items-center justify-center gap-1 rounded-lg bg-zinc-800/90 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
				className,
			)}
		>
			{options.map((option) => {
				const isActive = option.value === value;

				return (
					<button
						key={option.value}
						type="button"
						data-slot="button"
						aria-pressed={isActive}
						onClick={() => onChange(option.value)}
						className={cn(
							"rounded-md border border-transparent font-medium whitespace-nowrap transition-colors outline-none focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-500/40",
							size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
							isActive
								? "bg-zinc-700 text-zinc-100 shadow-sm"
								: "text-zinc-400 hover:text-zinc-200",
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
