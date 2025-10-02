import React, { useEffect, useMemo, useRef, useState } from "react";

// Minimal Cytoscape usage without React wrapper to keep it simple to integrate
// Make sure to install dependency in your app: `npm install cytoscape`
let cytoscapeLib = null;
try {
  // Lazy require so SSR environments won't fail
  // Will be initialized in useEffect only in the browser
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  cytoscapeLib = require("cytoscape");
} catch (_) {}

export default function KGDashboard({
  apiBase = "http://localhost:8080",
  height = 520,
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selected, setSelected] = useState(null);

  const style = useMemo(
    () => ({
      container: {
        width: "100%",
        height,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#0b0e2c",
      },
      header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      },
      badge: {
        fontSize: 12,
        padding: "4px 8px",
        border: "1px solid rgba(231,207,255,0.35)",
        borderRadius: 999,
        color: "#E7CFFF",
        background: "rgba(231,207,255,0.12)",
      },
      modalBackdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: selected ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      },
      modal: {
        width: "min(680px, 92vw)",
        background: "#111636",
        color: "#EAF2FF",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 16,
      },
      btn: {
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.2)",
        background: "linear-gradient(135deg,#7C5CFF,#4C3FE1)",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
      },
    }),
    [height, selected]
  );

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [nRes, eRes] = await Promise.all([
          fetch(`${apiBase}/kg/nodes.json`),
          fetch(`${apiBase}/kg/edges.json`),
        ]);
        if (!nRes.ok || !eRes.ok) {
          throw new Error(`Fetch error ${nRes.status} / ${eRes.status}`);
        }
        const [nJson, eJson] = await Promise.all([nRes.json(), eRes.json()]);
        if (!isCancelled) {
          setNodes(Array.isArray(nJson) ? nJson : []);
          setEdges(Array.isArray(eJson) ? eJson : []);
        }
      } catch (e) {
        if (!isCancelled) setError(e.message || "Failed to load KG JSON");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [apiBase]);

  useEffect(() => {
    if (!containerRef.current || !cytoscapeLib) return;
    // Destroy previous instance
    if (cyRef.current) {
      try { cyRef.current.destroy(); } catch (_) {}
      cyRef.current = null;
    }
    const elements = [];
    for (const n of nodes) {
      elements.push({ data: { id: n.id, label: n.label || n.id, type: n.type || "Entity" } });
    }
    for (const e of edges) {
      if (e.source && e.target) {
        elements.push({ data: { id: `${e.source}->${e.target}-${e.relation || "rel"}`.slice(0, 64), source: e.source, target: e.target, relation: e.relation || "rel" } });
      }
    }
    const cy = cytoscapeLib({
      container: containerRef.current,
      elements,
      style: [
        { selector: "node", style: { "background-color": "#7C5CFF", label: "data(label)", color: "#EAF2FF", "font-size": 10, "text-wrap": "wrap", "text-max-width": 120 } },
        { selector: "node[type='Article']", style: { "background-color": "#22C55E" } },
        { selector: "node[type='Experiment']", style: { "background-color": "#4C3FE1" } },
        { selector: "node[type='Biological System']", style: { "background-color": "#F59E0B" } },
        { selector: "node[type='Effect']", style: { "background-color": "#EF4444" } },
        { selector: "node[type='Project']", style: { "background-color": "#06B6D4" } },
        { selector: "edge", style: { width: 1.5, "line-color": "#94a3b8", "target-arrow-color": "#94a3b8", "curve-style": "bezier", "target-arrow-shape": "triangle", label: "data(relation)", "font-size": 8, color: "#cbd5e1" } },
        { selector: ":selected", style: { "border-width": 3, "border-color": "#E7CFFF" } },
      ],
      layout: { name: "cose", animate: true },
      wheelSensitivity: 0.2,
    });
    cyRef.current = cy;

    cy.on("tap", "node", (evt) => {
      const d = evt.target.data();
      if (!d) return;
      setSelected({ id: d.id, type: d.type, label: d.label });
    });

    return () => {
      try { cy.destroy(); } catch (_) {}
      cyRef.current = null;
    };
  }, [nodes, edges]);

  const articleDetails = useMemo(() => {
    if (!selected || selected.type !== "Article") return null;
    // Placeholder: in a real app, fetch summary by article id from backend
    return {
      title: selected.label,
      summary: "Summary not loaded in this demo component. Integrate API to show real summaries.",
    };
  }, [selected]);

  const experimentDetails = useMemo(() => {
    if (!selected || selected.type !== "Experiment") return null;
    return {
      name: selected.label,
      details: "Experiment details placeholder. Extend backend to return richer metadata.",
    };
  }, [selected]);

  return (
    <div>
      <div style={style.header}>
        <div style={{ color: "#EAF2FF", fontWeight: 900 }}>Knowledge Graph</div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={style.badge}>Nodes: {nodes.length}</span>
          <span style={style.badge}>Edges: {edges.length}</span>
        </div>
      </div>
      {loading && (
        <div style={{ color: "#EAF2FF", opacity: 0.9, marginBottom: 8 }}>Loading graph…</div>
      )}
      {error && (
        <div style={{ color: "#fff", background: "#7f1d1d", border: "1px solid #b91c1c", padding: 10, borderRadius: 8, marginBottom: 8 }}>Error: {error}</div>
      )}
      <div ref={containerRef} style={style.container} />

      {/* Simple modal */}
      <div style={style.modalBackdrop} onClick={() => setSelected(null)}>
        <div style={style.modal} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 900 }}>
              {selected?.type}: {selected?.label}
            </div>
            <button style={style.btn} onClick={() => setSelected(null)}>Close</button>
          </div>
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>
            {articleDetails && (
              <div>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Article</div>
                <div><strong>Title:</strong> {articleDetails.title}</div>
                <div style={{ marginTop: 6 }}><strong>Summary:</strong> {articleDetails.summary}</div>
              </div>
            )}
            {experimentDetails && (
              <div>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Experiment</div>
                <div><strong>Name:</strong> {experimentDetails.name}</div>
                <div style={{ marginTop: 6 }}><strong>Details:</strong> {experimentDetails.details}</div>
              </div>
            )}
            {!articleDetails && !experimentDetails && (
              <div>Details not available for this node type.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


