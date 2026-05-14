interface BorderBeamProps {
	active: boolean;
	radius?: string;
	children: React.ReactNode;
}

export function BorderBeam({ active, radius = "0.75rem", children }: BorderBeamProps) {
	return (
		<div className="relative" style={{ borderRadius: radius }}>
			{children}
			{active && <span aria-hidden className="border-beam-ring" style={{ borderRadius: radius }} />}
		</div>
	);
}
