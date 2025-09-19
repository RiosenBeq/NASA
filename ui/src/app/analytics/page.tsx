"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type KgStats = {
  node_types: Record<string, number>;
  edge_relations: Record<string, number>;
  node_count: number;
  edge_count: number;
};

export default function AnalyticsPage() {
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const [stats, setStats] = useState<KgStats | null>(null);
  const [years, setYears] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, y] = await Promise.all([
          fetch(`${api}/kg/stats`).then((r) => r.json()),
          fetch(`${api}/kg/year_counts`).then((r) => r.json()),
        ]);
        setStats(s);
        setYears(y?.data || null);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load analytics";
        setError(msg);
      }
    }
    load();
  }, [api]);

  const nodeTypeEntries = useMemo<[string, number][]>(() => {
    return stats?.node_types ? (Object.entries(stats.node_types) as [string, number][]) : [];
  }, [stats]);

  const edgeRelEntries = useMemo<[string, number][]>(() => {
    return stats?.edge_relations ? (Object.entries(stats.edge_relations) as [string, number][]) : [];
  }, [stats]);

  const yearEntries = useMemo<[string, number][]>(() => {
    if (!years) return [] as [string, number][];
    return (Object.entries(years) as [string, number][])?.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  }, [years]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0B0E2C 0%, #1B1270 60%, #4C3FE1 100%)", color: "#EAF2FF" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, backdropFilter: "saturate(120%) blur(6px)", background: "rgba(11,14,44,0.45)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 900, letterSpacing: 0.3, fontSize: 18 }}>Analytics • Knowledge Graph</div>
          <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" style={{ color: "#EAF2FF", textDecoration: "none", fontSize: 14 }}>Home</Link>
            <Link href="/guidelines" style={{ color: "#EAF2FF", textDecoration: "none", fontSize: 14 }}>Guidelines</Link>
            <Link href="/resources" style={{ color: "#EAF2FF", textDecoration: "none", fontSize: 14 }}>Resources</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "24px auto", padding: 16, display: "grid", gap: 16 }}>
        {error && (
          <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,0,0,0.12)", border: "1px solid rgba(255,0,0,0.3)" }}>{error}</div>
        )}

        {/* Summary cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div style={cardStyle}>
            <div style={cardTitle}>Nodes</div>
            <div style={bigNum}>{stats?.node_count ?? "…"}</div>
          </div>
          <div style={cardStyle}>
            <div style={cardTitle}>Edges</div>
            <div style={bigNum}>{stats?.edge_count ?? "…"}</div>
          </div>
          <div style={cardStyle}>
            <div style={cardTitle}>Years</div>
            <div style={bigNum}>{yearEntries.length || "…"}</div>
          </div>
        </section>

        {/* Node types pie & Edge relations bar */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={panelStyle}>
            <h3 style={h3}>Node Types</h3>
            {nodeTypeEntries.length === 0 ? (
              <div>Loading…</div>
            ) : (
              <PieChart data={nodeTypeEntries} colors={["#4C3FE1", "#22C55E", "#E7CFFF", "#FFC107", "#FF5722", "#7C5CFF"]} />
            )}
          </div>
          <div style={panelStyle}>
            <h3 style={h3}>Edge Relations</h3>
            {edgeRelEntries.length === 0 ? (
              <div>Loading…</div>
            ) : (
              <BarChart data={edgeRelEntries} color="#7C5CFF" />
            )}
          </div>
        </section>

        {/* Timeline line chart */}
        <section style={panelStyle}>
          <h3 style={h3}>Timeline (Publications by Year)</h3>
          {yearEntries.length === 0 ? (
            <div>Loading…</div>
          ) : (
            <LineChart data={yearEntries} color="#22C55E" />
          )}
        </section>
      </main>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: 16,
  textAlign: "center",
};
const cardTitle: React.CSSProperties = { fontSize: 12, opacity: 0.9 };
const bigNum: React.CSSProperties = { fontSize: 28, fontWeight: 900, marginTop: 6 };
const panelStyle: React.CSSProperties = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 16 };
const h3: React.CSSProperties = { marginTop: 0, fontSize: 16, fontWeight: 800 };

function PieChart({ data, colors }: { data: [string, number][]; colors: string[] }) {
  const total = data.reduce((s, [, v]) => s + v, 0) || 1;
  const size = 240;
  const radius = size / 2;
  let angle = 0;
  const slices = data.map(([label, value], i) => {
    const frac = value / total;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    const x1 = radius + radius * Math.cos(start);
    const y1 = radius + radius * Math.sin(start);
    const x2 = radius + radius * Math.cos(end);
    const y2 = radius + radius * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    const d = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { d, color: colors[i % colors.length], label, value };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} opacity={0.9} />
      ))}</svg>
      <div style={{ display: "grid", gap: 6 }}>
        {data.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ width: 12, height: 12, background: colors[i % colors.length], display: "inline-block", borderRadius: 2 }} />
            <span style={{ opacity: 0.9 }}>{k}</span>
            <span style={{ marginLeft: "auto", fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, color }: { data: [string, number][]; color: string }) {
  const maxVal = Math.max(...data.map(([, v]) => v), 1);
  const width = 480;
  const height = 220;
  const padding = 24;
  const barW = (width - padding * 2) / data.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map(([k, v], i) => {
        const h = (v / maxVal) * (height - padding * 2);
        const x = padding + i * barW;
        const y = height - padding - h;
        return (
          <g key={k}>
            <rect x={x + 4} y={y} width={Math.max(6, barW - 8)} height={h} fill={color} opacity={0.9} rx={6} />
            <text x={x + barW / 2} y={height - 6} fill="#EAF2FF" fontSize={10} textAnchor="middle" style={{ opacity: 0.85 }}>{k}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, color }: { data: [string, number][]; color: string }) {
  const width = 900;
  const height = 260;
  const padding = 28;
  const xs = data.map(([x]) => parseInt(x));
  const ys = data.map(([, y]) => y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMax = Math.max(...ys, 1);
  const xScale = (x: number) => padding + ((x - xMin) / Math.max(1, xMax - xMin)) * (width - padding * 2);
  const yScale = (y: number) => height - padding - (y / yMax) * (height - padding * 2);
  const points = xs.map((x, i) => `${xScale(x)},${yScale(ys[i])}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* axes */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#A7B0FF" strokeOpacity={0.4} />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#A7B0FF" strokeOpacity={0.4} />
      {/* path */}
      <polyline fill="none" stroke={color} strokeWidth={2.5} points={points} />
      {/* dots + labels */}
      {xs.map((x, i) => (
        <g key={x}>
          <circle cx={xScale(x)} cy={yScale(ys[i])} r={3} fill={color} />
          <text x={xScale(x)} y={height - padding + 12} fill="#EAF2FF" fontSize={10} textAnchor="middle" opacity={0.85}>{x}</text>
        </g>
      ))}
    </svg>
  );
}


