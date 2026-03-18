import { QueryProvider } from "@/shared/config/query-client";
import { DevTools } from "@/shared/ui/DevTools";
import { ProdTools } from "@/shared/ui/ProdTools";

import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "Intel - Hub",
	description: "Personal multi-asset trading terminal",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={cn("dark", inter.variable, "font-sans", geist.variable)}>
			<body className="font-(family-name:--font-inter) antialiased">
				<QueryProvider>{children}</QueryProvider>
				<ProdTools />
				<DevTools />
			</body>
		</html>
	);
}
