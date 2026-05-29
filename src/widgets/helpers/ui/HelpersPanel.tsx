"use client";

import { Hash, Settings, UserCircle2 } from "lucide-react";
import type { ReactNode } from "react";

interface HelpersPanelProps {
  onOpenIsins: () => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
}

export function HelpersPanel({
  onOpenIsins,
  onOpenSettings,
  onOpenAccount,
}: HelpersPanelProps) {
  return (
    <div className="border-b border-[#1e1e2e] px-3 py-2.5 space-y-1.5">
      <h3 className="text-[10px] uppercase font-bold text-zinc-500">Helpers</h3>
      <div className="flex flex-wrap gap-1.5">
        <Pill
          icon={<Hash className="h-3 w-3" />}
          label="ISINs"
          onClick={onOpenIsins}
        />
        <Pill
          icon={<Settings className="h-3 w-3" />}
          label="Settings"
          onClick={onOpenSettings}
        />
        <Pill
          icon={<UserCircle2 className="h-3 w-3" />}
          label="Account / Exports"
          onClick={onOpenAccount}
        />
      </div>
    </div>
  );
}

function Pill({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
