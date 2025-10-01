"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type KgStats = {
  node_types: Record<string, number>;
  edge_relations: Record<string, number>;
  node_count: number;
  edge_count: number;
};

export default function AnalyticsPage() {
  const apiEnv = process.env.NEXT_PUBLIC_API_URL || "";
  const api = apiEnv.trim() ? apiEnv : "";
  const [stats, setStats] = useState<KgStats | null>(null);
  const [years, setYears] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const base = api || "";
        const [s, y] = await Promise.all([
          fetch(`${base}/api/kg/stats`).then((r) => r.json()).catch(async () => fetch(`/api/kg/stats`).then(r=>r.json())),
          fetch(`${base}/api/kg/year_counts`).then((r) => r.json()).catch(async () => fetch(`/api/kg/year_counts`).then(r=>r.json())),
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
    <>
      {/* Space Background */}
      <div className="space-background" />
      <div className="stars stars-layer-1" />
      <div className="stars stars-layer-2" />
      <div className="stars stars-layer-3" />
      <div className="nebula">
        <div className="nebula-glow-1" />
        <div className="nebula-glow-2" />
        <div className="nebula-glow-3" />
      </div>

      <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
        {/* Premium Header */}
        <header className="header-sticky">
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Image src="/logo.png" alt="logo" width={52} height={52} priority className="glow pulse-slow" />
              <div>
                <div className="text-gradient" style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.3 }}>
                  Analytics Dashboard
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2, fontWeight: 500 }}>KNOWLEDGE GRAPH INSIGHTS</div>
              </div>
            </div>
            
            <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/" className="btn-secondary" style={{ fontSize: 13 }}>Home</Link>
              <Link href="/guidelines" className="btn-secondary" style={{ fontSize: 13 }}>Guidelines</Link>
              <Link href="/resources" className="btn-secondary" style={{ fontSize: 13 }}>Resources</Link>
              <Link href="/scientist" className="btn-secondary" style={{ fontSize: 13 }}>Scientist</Link>
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: "32px auto", padding: "0 24px" }}>
          {error && (
            <div className="glass-card" style={{ marginBottom: 24, padding: 20, border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Summary Cards */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
            <div className="glass-card" style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(167, 139, 250, 0.2), transparent)", filter: "blur(30px)" }} />
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 12, letterSpacing: 1.2 }}>TOTAL NODES</div>
              <div className="text-gradient" style={{ fontSize: 42, fontWeight: 900, position: "relative" }}>
                {stats?.node_count?.toLocaleString() ?? "..."}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, opacity: 0.8 }}>🔬 Research entities</div>
            </div>
            
            <div className="glass-card" style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(96, 165, 250, 0.2), transparent)", filter: "blur(30px)" }} />
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 12, letterSpacing: 1.2 }}>TOTAL EDGES</div>
              <div className="text-gradient" style={{ fontSize: 42, fontWeight: 900, position: "relative" }}>
                {stats?.edge_count?.toLocaleString() ?? "..."}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, opacity: 0.8 }}>🔗 Relationships</div>
            </div>
            
            <div className="glass-card" style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(34, 211, 238, 0.2), transparent)", filter: "blur(30px)" }} />
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 12, letterSpacing: 1.2 }}>YEAR SPAN</div>
              <div className="text-gradient" style={{ fontSize: 42, fontWeight: 900, position: "relative" }}>
                {yearEntries.length || "..."}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, opacity: 0.8 }}>📅 Publication years</div>
            </div>
          </section>

          {/* Charts Section */}
          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ margin: 0, marginBottom: 20, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                🔬 Node Types Distribution
              </h3>
              {nodeTypeEntries.length === 0 ? (
                <div className="loading-shimmer" style={{ height: 240, borderRadius: 12 }} />
              ) : (
                <PieChart data={nodeTypeEntries} colors={["#a78bfa", "#60a5fa", "#22d3ee", "#f472b6", "#fbbf24", "#34d399"]} />
              )}
            </div>
            
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ margin: 0, marginBottom: 20, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                🔗 Edge Relations
              </h3>
              {edgeRelEntries.length === 0 ? (
                <div className="loading-shimmer" style={{ height: 240, borderRadius: 12 }} />
              ) : (
                <BarChart data={edgeRelEntries} color="#a78bfa" />
              )}
            </div>
          </section>

          {/* Timeline */}
          <section className="glass-card" style={{ padding: 32 }}>
            <h3 style={{ margin: 0, marginBottom: 24, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
              📊 Publication Timeline
            </h3>
            {yearEntries.length === 0 ? (
              <div className="loading-shimmer" style={{ height: 300, borderRadius: 12 }} />
            ) : (
              <LineChart data={yearEntries} color="#22d3ee" />
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="glass-card" style={{ marginTop: 80, borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
              <Image src="/logo.png" alt="logo" width={28} height={28} className="glow" />
              <span className="text-gradient" style={{ fontWeight: 700, fontSize: 16 }}>NextGenLAB Space Bioscience Explorer</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Knowledge Graph Analytics • Real-time Insights</div>
          </div>
        </footer>
      </div>
    </>
  );
}

function PieChart({ data, colors }: { data: [string, number][]; colors: string[] }) {
  const total = data.reduce((sum, [, v]) => sum + v, 0) || 1;
  const size = 280;
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
    return { d, color: colors[i % colors.length], label, value, percent: (frac * 100).toFixed(1) };
  });
  
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 4px 20px rgba(167, 139, 250, 0.3))" }}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} opacity={0.85} style={{ transition: "opacity 0.3s" }} />
        ))}
      </svg>
      <div style={{ display: "grid", gap: 10 }}>
        {data.map(([k, v], i) => (
          <div key={k} className="badge" style={{ justifyContent: "space-between", minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 14, height: 14, background: colors[i % colors.length], display: "inline-block", borderRadius: 4, boxShadow: `0 0 10px ${colors[i % colors.length]}` }} />
              <span>{k}</span>
            </div>
            <span style={{ fontWeight: 700 }}>{v} ({slices[i].percent}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, color }: { data: [string, number][]; color: string }) {
  const maxVal = Math.max(...data.map(([, v]) => v), 1);
  const width = 520;
  const height = 260;
  const padding = 32;
  const barW = (width - padding * 2) / data.length;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.5 }} />
        </linearGradient>
      </defs>
      {data.map(([k, v], i) => {
        const h = (v / maxVal) * (height - padding * 2 - 20);
        const x = padding + i * barW;
        const y = height - padding - h - 20;
        return (
          <g key={k}>
            <rect 
              x={x + 6} 
              y={y} 
              width={Math.max(8, barW - 12)} 
              height={h} 
              fill="url(#barGradient)" 
              rx={8}
              style={{ filter: `drop-shadow(0 4px 12px ${color}40)` }}
            />
            <text 
              x={x + barW / 2} 
              y={height - 6} 
              fill="var(--text-secondary)" 
              fontSize={11} 
              textAnchor="middle" 
              fontWeight={500}
            >
              {k}
            </text>
            <text 
              x={x + barW / 2} 
              y={y - 6} 
              fill="var(--text-primary)" 
              fontSize={12} 
              textAnchor="middle" 
              fontWeight={700}
            >
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, color }: { data: [string, number][]; color: string }) {
  const width = 1100;
  const height = 300;
  const padding = 40;
  const xs = data.map(([x]) => parseInt(x));
  const ys = data.map(([, y]) => y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMax = Math.max(...ys, 1);
  const xScale = (x: number) => padding + ((x - xMin) / Math.max(1, xMax - xMin)) * (width - padding * 2);
  const yScale = (y: number) => height - padding - (y / yMax) * (height - padding * 2);
  const points = xs.map((x, i) => `${xScale(x)},${yScale(ys[i])}`).join(" ");
  
  const areaPoints = `${padding},${height - padding} ` + points + ` ${xScale(xMax)},${height - padding}`;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
        <line 
          key={frac} 
          x1={padding} 
          y1={height - padding - frac * (height - padding * 2)} 
          x2={width - padding} 
          y2={height - padding - frac * (height - padding * 2)} 
          stroke="rgba(167, 139, 250, 0.15)" 
          strokeDasharray="4 4"
        />
      ))}
      
      {/* Axes */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(167, 139, 250, 0.4)" strokeWidth={2} />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(167, 139, 250, 0.4)" strokeWidth={2} />
      
      {/* Area */}
      <polygon fill="url(#areaGradient)" points={areaPoints} />
      
      {/* Line */}
      <polyline 
        fill="none" 
        stroke={color} 
        strokeWidth={3} 
        points={points} 
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
      
      {/* Points */}
      {xs.map((x, i) => (
        <g key={x}>
          <circle 
            cx={xScale(x)} 
            cy={yScale(ys[i])} 
            r={5} 
            fill={color} 
            stroke="var(--deep-space)" 
            strokeWidth={2}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
          <text 
            x={xScale(x)} 
            y={height - padding + 20} 
            fill="var(--text-secondary)" 
            fontSize={11} 
            textAnchor="middle" 
            fontWeight={600}
          >
            {x}
          </text>
          <text 
            x={xScale(x)} 
            y={yScale(ys[i]) - 12} 
            fill="var(--text-primary)" 
            fontSize={11} 
            textAnchor="middle" 
            fontWeight={700}
          >
            {ys[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}
