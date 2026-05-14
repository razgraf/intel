interface IsinBadgeProps {
	isin: string;
}

export function IsinBadge({ isin }: IsinBadgeProps) {
	const head = isin.slice(0, 6);
	const needsTruncation = isin.length > 6;
	return (
		<span
			title={isin}
			className="group/isin relative inline-flex items-center overflow-hidden rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-400 cursor-default whitespace-nowrap [mask-image:linear-gradient(to_right,black_70%,transparent)] hover:[mask-image:linear-gradient(to_right,black_100%,transparent)] transition-[mask-image] duration-200"
		>
			<span className="group-hover/isin:hidden">
				{head}
				{needsTruncation && ".."}
			</span>
			<span className="hidden group-hover/isin:inline">{isin}</span>
		</span>
	);
}
