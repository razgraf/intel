"use client";

import { type ReactNode, createContext, useContext } from "react";

const AccountsContext = createContext<boolean>(false);

export function AccountsContextProvider({
	enabled,
	children,
}: {
	enabled: boolean;
	children: ReactNode;
}) {
	return <AccountsContext.Provider value={enabled}>{children}</AccountsContext.Provider>;
}

export function useAccountsEnabled(): boolean {
	return useContext(AccountsContext);
}
