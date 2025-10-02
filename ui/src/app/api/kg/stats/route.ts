import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const nodesPath = path.join(process.cwd(), "public", "kg_data", "nodes.json");
    const edgesPath = path.join(process.cwd(), "public", "kg_data", "edges.json");

    const stats = {
      node_types: {} as Record<string, number>,
      edge_relations: {} as Record<string, number>,
      node_count: 0,
      edge_count: 0
    };

    // Process nodes
    if (fs.existsSync(nodesPath)) {
      const nodesContent = fs.readFileSync(nodesPath, "utf8");
      const nodes = JSON.parse(nodesContent);
      stats.node_count = nodes.length;
      
      nodes.forEach((node: { type?: string }) => {
        const type = node.type || "Unknown";
        stats.node_types[type] = (stats.node_types[type] || 0) + 1;
      });
    }

    // Process edges
    if (fs.existsSync(edgesPath)) {
      const edgesContent = fs.readFileSync(edgesPath, "utf8");
      const edges = JSON.parse(edgesContent);
      stats.edge_count = edges.length;
      
      edges.forEach((edge: { relation?: string }) => {
        const relation = edge.relation || "related_to";
        stats.edge_relations[relation] = (stats.edge_relations[relation] || 0) + 1;
      });
    }

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[KG Stats] Error:", error);
    return NextResponse.json(
      { 
        node_types: {},
        edge_relations: {},
        node_count: 0,
        edge_count: 0
      },
      { status: 500 }
    );
  }
}
