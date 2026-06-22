// @singularityfp/theme — Brand wordmark ([singularity]FP). The canonical logo,
// identical across the marketing site and every product. Requires the 'Inter
// Tight' webfont (load per app). Word follows currentColor; brackets + raised
// "FP" are the fixed editorial teal (#4aa89e).
import type { CSSProperties } from 'react';

const BRAND_FONT =
  "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const TEAL = '#4aa89e';

export function Brand({ size = '1.05rem', className }: { size?: string; className?: string }) {
  const bracket: CSSProperties = { color: TEAL, fontWeight: 400, padding: '0 6px', fontSize: '1.15em', lineHeight: 1 };
  return (
    <span
      className={className}
      aria-label="Singularity Financial Partners"
      style={{
        fontFamily: BRAND_FONT, fontSize: size, fontWeight: 500, letterSpacing: '-0.005em',
        lineHeight: 1, display: 'inline-flex', alignItems: 'baseline', color: 'currentColor',
      }}
    >
      <span style={bracket}>[</span>
      <span style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>singularity</span>
      <span style={{ ...bracket, paddingRight: 0 }}>]</span>
      <span style={{ color: TEAL, fontSize: '0.6em', fontWeight: 500, letterSpacing: '0.04em', marginLeft: 1, transform: 'translateY(-0.5em)', display: 'inline-block' }}>FP</span>
    </span>
  );
}

export default Brand;
