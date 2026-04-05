export default function CounselorsLoading() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          className="animate-skeleton"
          style={{ height: 28, width: "24%", borderRadius: 6, background: "rgba(255,255,255,0.05)", marginBottom: 8 }}
        />
        <div
          className="animate-skeleton"
          style={{ height: 14, width: "65%", borderRadius: 5, background: "rgba(255,255,255,0.03)" }}
        />
      </div>

      {/* Counselor cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-skeleton"
            style={{
              height: 82,
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
