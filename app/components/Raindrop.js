export default function Raindrop({ size = 22, color = "#A9AEF2", style }) {
  return (
    <svg width={size} height={Math.round(size * 1.18)} viewBox="0 0 100 118" aria-hidden="true" style={style}>
      <path d="M50 4 C50 4 10 54 10 78 A40 40 0 0 0 90 78 C90 54 50 4 50 4 Z" fill={color} />
    </svg>
  );
}
