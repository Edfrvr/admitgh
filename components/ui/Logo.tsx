interface LogoProps {
  /** Size of the square icon in px. Defaults to 34. */
  size?: number;
  showWordmark?: boolean;
}

/**
 * AdmitGH brand logo mark (gold "A" icon + optional wordmark).
 * Server Component.
 */
export default function Logo({ size = 34, showWordmark = true }: LogoProps) {
  const fontSize = Math.round(size * 0.44);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.26),
          background: "linear-gradient(135deg,#fbbf24,#d97706)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize,
          fontWeight: 800,
          color: "#1a1410",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        A
      </div>
      {showWordmark && (
        <div>
          <div style={{ color: "#fbbf24", fontWeight: 800, fontSize: size * 0.53, lineHeight: 1 }}>
            AdmitGH
          </div>
          {size >= 30 && (
            <div style={{ color: "#555", fontSize: 8, letterSpacing: 1, textTransform: "uppercase" }}>
              Your Path to Uni
            </div>
          )}
        </div>
      )}
    </div>
  );
}
