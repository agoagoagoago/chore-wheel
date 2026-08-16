"use client";

import { memo } from "react";
import type { WheelItem } from "@/lib/wheel/state";
import { CENTER, RADIUS, WHEEL_SIZE, fitLabel, polar, segmentColor, segmentMidAngle, slicePath } from "@/lib/wheel/geometry";

type Props = {
  items: WheelItem[];
  rotation: number;
  animate: boolean;
  onSettled: () => void;
  highlightId?: string | null;
};

function labelFontSize(total: number) {
  if (total <= 8) return 17;
  if (total <= 12) return 15;
  if (total <= 20) return 12;
  if (total <= 32) return 10;
  return 8;
}

/**
 * The visual wheel. Purely presentational: it receives a target rotation and
 * reports back when the CSS transition finishes. Rendered as inline SVG so it
 * scales crisply, needs no image assets, and reserves its square before JS.
 */
export const WheelSvg = memo(function WheelSvg({ items, rotation, animate, onSettled, highlightId }: Props) {
  const total = items.length;
  const step = total > 0 ? 360 / total : 360;
  const showLabels = total > 0 && total <= 40;
  const fontSize = labelFontSize(total);

  return (
    <div className="relative mx-auto w-full max-w-[480px] aspect-square select-none">
      {/* Pointer */}
      <div aria-hidden="true" className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[6px]">
        <svg width="34" height="40" viewBox="0 0 34 40">
          <path d="M17 40 L2 8 Q17 -6 32 8 Z" fill="#1f1f1c" />
          <path d="M17 33 L7 10 Q17 1 27 10 Z" fill="#ffffff" />
        </svg>
      </div>

      <svg viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`} className="h-full w-full" aria-hidden="true" focusable="false">
        {/* Outer ring */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS + 3} fill="#1f1f1c" />
        <g
          className={`wheel-rotor${animate ? "" : " no-transition"}`}
          style={{ transform: `rotate(${rotation}deg)` }}
          onTransitionEnd={(e) => {
            if (e.propertyName === "transform") onSettled();
          }}
        >
          {/* White base so dimmed segments fade toward white, not the dark ring */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#ffffff" />
          {total === 0 ? (
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#f3f1eb" />
          ) : (
            items.map((item, i) => {
              const start = i * step;
              const end = (i + 1) * step;
              const mid = segmentMidAngle(i, total);
              const labelPos = polar(mid, RADIUS - 14);
              const isHighlight = highlightId === item.id;
              // Labels on the left half are flipped so they read the right way up.
              const flip = mid > 180;
              return (
                <g key={item.id}>
                  <path
                    d={slicePath(start, end)}
                    fill={segmentColor(i, total)}
                    stroke="#ffffff"
                    strokeWidth={total > 1 ? 1.5 : 0}
                    opacity={highlightId && !isHighlight ? 0.45 : 1}
                  />
                  {showLabels ? (
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      fontSize={fontSize}
                      fontWeight={600}
                      fill="#1f1f1c"
                      textAnchor={flip ? "start" : "end"}
                      dominantBaseline="middle"
                      transform={`rotate(${flip ? mid + 90 : mid - 90} ${labelPos.x} ${labelPos.y})`}
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {fitLabel(item.name, total)}
                    </text>
                  ) : null}
                </g>
              );
            })
          )}
        </g>
        {/* Hub */}
        <circle cx={CENTER} cy={CENTER} r={26} fill="#ffffff" stroke="#1f1f1c" strokeWidth={4} />
        <circle cx={CENTER} cy={CENTER} r={7} fill="#1f1f1c" />
      </svg>
    </div>
  );
});
