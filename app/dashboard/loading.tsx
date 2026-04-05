function Skel({
  width,
  height,
  radius = 8,
  mb = 0,
}: {
  width?: string | number;
  height: number;
  radius?: number;
  mb?: number;
}) {
  return (
    <div
      className="animate-skeleton"
      style={{
        width: width ?? "100%",
        height,
        borderRadius: radius,
        background: "rgba(255,255,255,0.05)",
        marginBottom: mb,
      }}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <Skel height={28} width="30%" radius={6} mb={8} />
        <Skel height={14} width="55%" radius={5} />
      </div>

      {/* Stats row */}
      <div
        className="stats-grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-skeleton"
            style={{
              height: 80,
              borderRadius: 13,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          />
        ))}
      </div>

      {/* Section blocks */}
      {[120, 100, 140, 100, 120, 80].map((h, i) => (
        <div
          key={i}
          className="animate-skeleton"
          style={{
            height: h,
            borderRadius: 13,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.04)",
            marginBottom: 14,
          }}
        />
      ))}
    </div>
  );
}
