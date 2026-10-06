import { ImageResponse } from "next/og";

// The periwinkle raindrop on midnight, drawn as a PNG for phone home screens.
export function appIcon(size) {
  const drop = Math.round(size * 0.52);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#110527" }}>
        <svg width={drop} height={Math.round(drop * 1.18)} viewBox="0 0 100 118">
          <path d="M50 4 C50 4 10 54 10 78 A40 40 0 0 0 90 78 C90 54 50 4 50 4 Z" fill="#A9AEF2" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
