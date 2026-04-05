export default function Loading() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Header skeleton */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: 14,
          padding: 24,
          marginBottom: 16,
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 14,
            background: "rgba(251,191,36,0.06)",
          }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 22, width: "40%", background: "rgba(255,255,255,0.05)", borderRadius: 6 }} />
          <div style={{ height: 14, width: "60%", background: "rgba(255,255,255,0.03)", borderRadius: 6 }} />
        </div>
      </div>

      {/* Stats skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 70,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: 12,
            }}
          />
        ))}
      </div>

      {/* Content skeleton rows */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          style={{
            height: 100,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 13,
            marginBottom: 14,
          }}
        />
      ))}
    </div>
  );
}
