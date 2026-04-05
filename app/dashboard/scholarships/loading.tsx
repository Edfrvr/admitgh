export default function ScholarshipsLoading() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          className="animate-skeleton"
          style={{ height: 28, width: "26%", borderRadius: 6, background: "rgba(255,255,255,0.05)", marginBottom: 8 }}
        />
        <div
          className="animate-skeleton"
          style={{ height: 14, width: "60%", borderRadius: 5, background: "rgba(255,255,255,0.03)" }}
        />
      </div>

      {/* Scholarship cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-skeleton"
            style={{
              height: 140,
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
