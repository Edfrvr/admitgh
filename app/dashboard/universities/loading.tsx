export default function UniversitiesLoading() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          className="animate-skeleton"
          style={{ height: 28, width: "28%", borderRadius: 6, background: "rgba(255,255,255,0.05)", marginBottom: 8 }}
        />
        <div
          className="animate-skeleton"
          style={{ height: 14, width: "50%", borderRadius: 5, background: "rgba(255,255,255,0.03)" }}
        />
      </div>

      {/* Card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-skeleton"
            style={{
              height: 200,
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
