"use client";
import React, { useEffect, useRef, useState } from "react";

// Lightweight Cytoscape import without types
import cytoscape from "cytoscape";

export default function KGDashboard() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    async function load() {
      try {
        // Prefer static served KG JSONs from backend
        const [nodesRes, edgesRes] = await Promise.all([
          fetch(`${api}/kg_static/nodes.json`),
          fetch(`${api}/kg_static/edges.json`),
        ]);
        const nodes = await nodesRes.json();
        const edges = await edgesRes.json();

        if (cyRef.current) {
          cyRef.current.destroy();
          cyRef.current = null;
        }

        const elements = [
          ...nodes.map((n) => ({ data: { id: String(n.id), label: n.label, type: n.type, raw: n } })),
          ...edges.map((e) => ({ data: { id: `${e.source}-${e.target}-${e.relation}` , source: String(e.source), target: String(e.target), relation: e.relation } })),
        ];

        cyRef.current = cytoscape({
          container: containerRef.current,
          elements,
          style: [
            {
              selector: "node",
              style: {
                label: "data(label)",
                "font-size": 10,
                color: "#EAF2FF",
                "text-outline-width": 2,
                "text-outline-color": "#1B1270",
                "background-color": (ele) => {
                  const t = ele.data("type");
                  if (t === "Article") return "#4C3FE1";
                  if (t === "Experiment") return "#22C55E";
                  if (t === "Project") return "#7C5CFF";
                  if (t === "Biological System") return "#E7CFFF";
                  if (t === "Effect") return "#9AE6B4";
                  return "#8892F6";
                },
                width: 16,
                height: 16,
              },
            },
            {
              selector: "edge",
              style: {
                width: 1,
                "line-color": "#6B6EF9",
                "target-arrow-color": "#6B6EF9",
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
              },
            },
          ],
          layout: { name: "cose", animate: true, padding: 10 },
        });

        cyRef.current.on("tap", "node", (evt) => {
          const node = evt.target;
          const d = node.data();
          setInfo({
            title: d.raw?.title || d.label,
            type: d.type,
            label: d.label,
            raw: d.raw,
          });
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("KG load error", e);
      }
    }
    load();
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
      <div ref={containerRef} style={{ height: 460, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16 }} />
      <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 12 }}>
        <h3 style={{ marginTop: 0, fontSize: 16, fontWeight: 800 }}>KG Inspector</h3>
        {!info && <div style={{ opacity: 0.8, fontSize: 13 }}>Tap a node to inspect…</div>}
        {info && (
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <div style={{ opacity: 0.9 }}>Type: <strong>{info.type}</strong></div>
            <div style={{ marginTop: 6 }}><strong>{info.title}</strong></div>
            {info.raw?.url && (
              <div style={{ marginTop: 6 }}>
                <a href={info.raw.url} target="_blank" rel="noreferrer" style={{ color: "#E7CFFF" }}>Open Source</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


