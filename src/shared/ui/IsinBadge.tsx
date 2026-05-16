import { motion, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

interface IsinBadgeProps {
  isin: string;
}

const TRUNC = 5;
const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];
const DURATION = 0.25;
const MASK_COLLAPSED = "linear-gradient(to right, black 70%, transparent 100%)";
const MASK_FULL = "linear-gradient(to right, black 100%, transparent 100%)";

export function IsinBadge({ isin }: IsinBadgeProps) {
  const head = isin.slice(0, TRUNC);
  const needsTruncation = isin.length > TRUNC;
  const display = needsTruncation ? `${head}..` : head;

  const collapsedRef = useRef<HTMLSpanElement>(null);
  const fullRef = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<{
    collapsed: number;
    full: number;
  } | null>(null);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when isin changes — refs are stable, the mirror spans' text comes from isin
  useLayoutEffect(() => {
    if (!collapsedRef.current || !fullRef.current) return;
    setWidths({
      collapsed: collapsedRef.current.offsetWidth,
      full: fullRef.current.offsetWidth,
    });
  }, [isin]);

  return (
    <motion.span
      title={isin}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ width: widths?.full }}
      animate={
        widths
          ? {
              width: hovered ? widths.full : widths.collapsed,
              maskImage: hovered ? MASK_FULL : MASK_COLLAPSED,
            }
          : undefined
      }
      transition={{ duration: reduceMotion ? 0 : DURATION, ease: EASE }}
      style={{ maskImage: MASK_COLLAPSED }}
      className="relative inline-flex items-center overflow-hidden rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-400 cursor-default whitespace-nowrap"
    >
      <span
        ref={collapsedRef}
        aria-hidden
        className="invisible absolute left-0 top-0 px-2 py-0.5 whitespace-nowrap"
      >
        {display}
      </span>
      <span
        ref={fullRef}
        aria-hidden
        className="invisible absolute left-0 top-0 px-2 py-0.5 whitespace-nowrap"
      >
        {isin}
      </span>
      <span>{isin}</span>
    </motion.span>
  );
}
