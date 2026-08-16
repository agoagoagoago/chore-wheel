import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/config/site";
import { WHEEL_COLORS, slicePath } from "@/lib/wheel/geometry";

export const alt = `${SITE_NAME} – randomly pick and assign household chores`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Static social-sharing image generated at build time. Replace with a designed
 * PNG (public/og.png + metadata) whenever you have one; this keeps share
 * previews meaningful in the meantime.
 */
export default function OpenGraphImage() {
  const segments = 12;
  const step = 360 / segments;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fbfaf7",
        padding: "70px 90px",
        fontFamily: "system-ui, sans-serif",
        color: "#1f1f1c",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>{SITE_NAME}</div>
        <div style={{ marginTop: 26, fontSize: 36, color: "#5c5b55", lineHeight: 1.3 }}>Let the wheel decide who does what.</div>
        <div style={{ marginTop: 34, fontSize: 26, color: "#0f766e", fontWeight: 600 }}>Spin · Assign · Save · Share · Print</div>
      </div>
      <svg width="440" height="440" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="199" fill="#1f1f1c" />
        {Array.from({ length: segments }, (_, i) => (
          <path
            key={i}
            d={slicePath(i * step, (i + 1) * step)}
            fill={WHEEL_COLORS[i % WHEEL_COLORS.length]}
            stroke="#fff"
            strokeWidth={2}
          />
        ))}
        <circle cx="200" cy="200" r="28" fill="#fff" stroke="#1f1f1c" strokeWidth={5} />
        <circle cx="200" cy="200" r="8" fill="#1f1f1c" />
        <path d="M200 60 L182 18 Q200 2 218 18 Z" fill="#1f1f1c" />
      </svg>
    </div>,
    { ...size },
  );
}
