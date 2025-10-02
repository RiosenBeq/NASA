"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type KgStats = {
  node_types: Record<string, number>;
  edge_relations: Record<string, number>;
  node_count: number;
  edge_count: number;
};

type AnalyticsData = {
  stats: KgStats | null;
  years: Record<string, number> | null;
  lastUpdated: Date;
  loading: boolean;
  error: string | null;
};

export default function AnalyticsPage() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const apiEnv = process.env.NEXT_PUBLIC_API_URL || "";
  const api = apiEnv.trim() ? apiEnv : "";
  const [data, setData] = useState<AnalyticsData>({
    stats: null,
    years: null,
    lastUpdated: new Date(),
    loading: true,
    error: null
  });

  const T = (key: string) => {
    const tr: Record<string, string> = {
      // Header
      pageTitle: "Analytics Dashboard",
      pageSubtitle: "KNOWLEDGE GRAPH INSIGHTS",
      navHome: "Ana Sayfa",
      navGuidelines: "Kılavuz",
      navResources: "Kaynaklar",
      
      // Filters
      filtersTitle: "🔍 Filtreler & Kontroller",
      timeAll: "Tüm Zamanlar",
      timeDecade: "Son 10 Yıl",
      timeRecent: "Son 5 Yıl",
      nodeAll: "Tüm Tipler",
      sortCount: "Sayıya Göre",
      sortName: "İsme Göre",
      sortTrend: "Trende Göre",
      
      // Tooltips
      nodesLabel: "nodes",
      edgesLabel: "edges",
      yearsLabel: "years",
      nodesTooltip: "Nodes: Bilgi grafiğindeki temel varlıklar (Makaleler, Deneyler, Organizmalar vb.)",
      edgesTooltip: "Edges: Varlıklar arasındaki ilişkiler ve bağlantılar",
      yearsTooltip: "Years: Yayınların zaman içindeki dağılımı ve trend analizi",
      
      // Summary Cards
      totalNodes: "TOTAL NODES",
      totalEdges: "TOTAL EDGES",
      publications: "YAYINLAR",
      avgYear: "ORT/YIL",
      growthRate: "BÜYÜME ORANI",
      yearSpan: "YIL ARALIĞI",
      researchEntities: "🔬 Araştırma varlıkları",
      relationships: "🔗 İlişkiler",
      totalPapers: "📚 Toplam yayınlar",
      average: "📊 Ortalama",
      recentTrend: "📈 Son trend",
      publicationYears: "📅 Yayın yılları",
      
      // Charts
      nodeTypesTitle: "🔬 Node Türü Dağılımı",
      edgeRelationsTitle: "🔗 Edge İlişkileri",
      timelineTitle: "📊 Yayın Zaman Çizelgesi",
      exportButton: "📊 Dışa Aktar",
      exportAll: "📁 Tümünü Dışa Aktar",
      noData: "Veri yok",
      noTimelineData: "Zaman çizelgesi verisi yok",
      
      // Footer
      footerBrand: "NextGenLAB Space Bioscience Explorer",
      footerStats: "Knowledge Graph Analytics • Real-time Insights",
    };
    
    const en: Record<string, string> = {
      // Header
      pageTitle: "Analytics Dashboard",
      pageSubtitle: "KNOWLEDGE GRAPH INSIGHTS",
      navHome: "Home",
      navGuidelines: "Guidelines",
      navResources: "Resources",
      
      // Filters
      filtersTitle: "🔍 Filters & Controls",
      timeAll: "All Time",
      timeDecade: "Last Decade",
      timeRecent: "Last 5 Years",
      nodeAll: "All Types",
      sortCount: "Sort by Count",
      sortName: "Sort by Name",
      sortTrend: "Sort by Trend",
      
      // Tooltips
      nodesLabel: "nodes",
      edgesLabel: "edges",
      yearsLabel: "years",
      nodesTooltip: "Nodes: Fundamental entities in the knowledge graph (Articles, Experiments, Organisms, etc.)",
      edgesTooltip: "Edges: Relationships and connections between entities",
      yearsTooltip: "Years: Distribution and trend analysis of publications over time",
      
      // Summary Cards
      totalNodes: "TOTAL NODES",
      totalEdges: "TOTAL EDGES",
      publications: "PUBLICATIONS",
      avgYear: "AVG/YEAR",
      growthRate: "GROWTH RATE",
      yearSpan: "YEAR SPAN",
      researchEntities: "🔬 Research entities",
      relationships: "🔗 Relationships",
      totalPapers: "📚 Total papers",
      average: "📊 Average",
      recentTrend: "📈 Recent trend",
      publicationYears: "📅 Publication years",
      
      // Charts
      nodeTypesTitle: "🔬 Node Types Distribution",
      edgeRelationsTitle: "🔗 Edge Relations",
      timelineTitle: "📊 Publication Timeline",
      exportButton: "📊 Export",
      exportAll: "📁 Export All",
      noData: "No data available",
      noTimelineData: "No timeline data available",
      
      // Footer
      footerBrand: "NextGenLAB Space Bioscience Explorer",
      footerStats: "Knowledge Graph Analytics • Real-time Insights",
    };
    
    return (lang === "tr" ? tr : en)[key] || key;
  };

  const loadData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
        const base = api || "";
        const [s, y] = await Promise.all([
          fetch(`${base}/api/kg/stats`).then((r) => r.json()).catch(async () => fetch(`/api/kg/stats`).then(r=>r.json())),
          fetch(`${base}/api/kg/year_counts`).then((r) => r.json()).catch(async () => fetch(`/api/kg/year_counts`).then(r=>r.json())),
        ]);
      setData({
        stats: s,
        years: y?.data || null,
        lastUpdated: new Date(),
        loading: false,
        error: null
      });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load analytics";
      setData(prev => ({ ...prev, loading: false, error: msg }));
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  // Computed metrics
  const nodeTypeEntries = useMemo<[string, number][]>(() => {
    if (!data.stats?.node_types) return [];
    const entries = Object.entries(data.stats.node_types) as [string, number][];
    return entries.sort((a, b) => b[1] - a[1]);
  }, [data.stats]);

  const edgeRelEntries = useMemo<[string, number][]>(() => {
    if (!data.stats?.edge_relations) return [];
    const entries = Object.entries(data.stats.edge_relations) as [string, number][];
    return entries.sort((a, b) => b[1] - a[1]);
  }, [data.stats]);

  const yearEntries = useMemo<[string, number][]>(() => {
    if (!data.years) return [];
    const entries = Object.entries(data.years) as [string, number][];
    return entries.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  }, [data.years]);

  // Additional metrics
  const totalPublications = useMemo(() => {
    return yearEntries.reduce((sum, [, count]) => sum + count, 0);
  }, [yearEntries]);

  const averagePerYear = useMemo(() => {
    return yearEntries.length > 0 ? Math.round(totalPublications / yearEntries.length) : 0;
  }, [totalPublications, yearEntries.length]);

  const growthRate = useMemo(() => {
    if (yearEntries.length < 2) return 0;
    const recent = yearEntries.slice(-3).reduce((sum, [, count]) => sum + count, 0);
    const previous = yearEntries.slice(-6, -3).reduce((sum, [, count]) => sum + count, 0);
    return previous > 0 ? Math.round(((recent - previous) / previous) * 100) : 0;
  }, [yearEntries]);


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

      <div style={{ minHeight: "100vh", position: "relative", zIndex: 10 }}>
        {/* Premium Header */}
        <header className="header-sticky">
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0, flex: "1 1 200px" }}>
              <Image src="/logo.png" alt="NextGenLAB NASA Space Bioscience Explorer Logo" width={52} height={52} priority className="glow pulse-slow" />
              <div style={{ minWidth: 0 }}>
                <div className="text-gradient" style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
                  {T("pageTitle")}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2, fontWeight: 500, whiteSpace: "nowrap" }}>
                  {T("pageSubtitle")} • {data.lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <nav style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Link href="/" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{T("navHome")}</Link>
              <Link href="/guidelines" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{T("navGuidelines")}</Link>
              <Link href="/resources" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{T("navResources")}</Link>
              <select value={lang} onChange={(e) => setLang(e.target.value as "tr" | "en")} style={{ fontSize: 13, fontWeight: 500, minWidth: 60 }}>
                <option value="tr">🇹🇷</option>
                <option value="en">🇬🇧</option>
              </select>
          </nav>
        </div>
      </header>

        <main style={{ maxWidth: 1200, margin: "32px auto", padding: "0 24px" }}>
          {data.error && (
            <div className="glass-card" style={{ marginBottom: 24, padding: 20, border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5" }}>
              ⚠️ {data.error}
            </div>
          )}


          {/* Summary Cards */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
            <div className="glass-card" style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden", cursor: "help" }} title="Bilgi grafiğindeki toplam varlık sayısı: Makaleler, deneyler, organizmalar, projeler ve diğer araştırma bileşenleri">
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(167, 139, 250, 0.2), transparent)", filter: "blur(30px)" }} />
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 12, letterSpacing: 1.2 }}>TOTAL NODES</div>
              <div className="text-gradient" style={{ fontSize: 42, fontWeight: 900, position: "relative" }}>
                {data.stats?.node_count?.toLocaleString() ?? "..."}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, opacity: 0.8 }}>🔬 Research entities</div>
            </div>
            
            <div className="glass-card" style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden", cursor: "help" }} title="Varlıklar arasındaki toplam bağlantı sayısı: DESCRIBES, INVOLVES, OBSERVES gibi ilişki türleri">
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(96, 165, 250, 0.2), transparent)", filter: "blur(30px)" }} />
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 12, letterSpacing: 1.2 }}>TOTAL EDGES</div>
              <div className="text-gradient" style={{ fontSize: 42, fontWeight: 900, position: "relative" }}>
                {data.stats?.edge_count?.toLocaleString() ?? "..."}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, opacity: 0.8 }}>🔗 Relationships</div>
            </div>
            
            <div className="glass-card" style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden", cursor: "help" }} title="NASA uzay biyobilim veritabanındaki toplam yayın sayısı">
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(34, 211, 238, 0.2), transparent)", filter: "blur(30px)" }} />
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 12, letterSpacing: 1.2 }}>PUBLICATIONS</div>
              <div className="text-gradient" style={{ fontSize: 42, fontWeight: 900, position: "relative" }}>
                {totalPublications.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, opacity: 0.8 }}>📚 Total papers</div>
            </div>
            
            <div className="glass-card" style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden", cursor: "help" }} title="Yıllık ortalama yayın sayısı: Toplam yayınların yıl sayısına bölümü">
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(52, 211, 153, 0.2), transparent)", filter: "blur(30px)" }} />
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 12, letterSpacing: 1.2 }}>AVG/YEAR</div>
              <div className="text-gradient" style={{ fontSize: 42, fontWeight: 900, position: "relative" }}>
                {averagePerYear}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, opacity: 0.8 }}>📊 Average</div>
            </div>
            
            <div className="glass-card" style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden", cursor: "help" }} title="Son 3 yıl ile önceki 3 yılın karşılaştırması: Yayın sayısındaki yüzdelik artış/azalış">
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(245, 101, 101, 0.2), transparent)", filter: "blur(30px)" }} />
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 12, letterSpacing: 1.2 }}>GROWTH RATE</div>
              <div className="text-gradient" style={{ fontSize: 42, fontWeight: 900, position: "relative", color: growthRate >= 0 ? "#22d3ee" : "#f87171" }}>
                {growthRate >= 0 ? '+' : ''}{growthRate}%
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, opacity: 0.8 }}>📈 Recent trend</div>
          </div>
            
            <div className="glass-card" style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden", cursor: "help" }} title="Yayınların kapsadığı toplam yıl sayısı: İlk ve son yayın arasındaki süre">
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent)", filter: "blur(30px)" }} />
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
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                  🔬 Node Types Distribution
                </h3>
              </div>
              {data.loading ? (
                <div className="loading-shimmer" style={{ height: 240, borderRadius: 12 }} />
              ) : nodeTypeEntries.length === 0 ? (
                <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                  No data available
                </div>
              ) : (
                <PieChart data={nodeTypeEntries} colors={["#a78bfa", "#60a5fa", "#22d3ee", "#f472b6", "#fbbf24", "#34d399"]} />
            )}
          </div>
            
            <div className="glass-card" style={{ padding: 28 }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                  🔗 Edge Relations
                </h3>
              </div>
              {data.loading ? (
                <div className="loading-shimmer" style={{ height: 240, borderRadius: 12 }} />
              ) : edgeRelEntries.length === 0 ? (
                <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                  No data available
                </div>
              ) : (
                <BarChart data={edgeRelEntries} color="#a78bfa" />
            )}
          </div>
        </section>

          {/* Timeline */}
          <section className="glass-card" style={{ padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                📊 Publication Timeline
              </h3>
            </div>
            {data.loading ? (
              <div className="loading-shimmer" style={{ height: 300, borderRadius: 12 }} />
            ) : yearEntries.length === 0 ? (
              <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                No timeline data available
              </div>
            ) : (
              <LineChart data={yearEntries} color="#22d3ee" />
          )}
        </section>
      </main>

        {/* Footer */}
        <footer className="glass-card" style={{ marginTop: 80, borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
              <Image src="/logo.png" alt="NextGenLAB Logo" width={28} height={28} className="glow" />
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
