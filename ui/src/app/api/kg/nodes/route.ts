import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "kg_data", "nodes.json");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Knowledge graph nodes not found" },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const nodes = JSON.parse(fileContents);

    return NextResponse.json(nodes, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[KG Nodes] Error:", error);
    return NextResponse.json(
      { error: "Failed to load knowledge graph nodes" },
      { status: 500 }
    );
  }
}
