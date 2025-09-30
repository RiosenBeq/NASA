import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "kg_data", "edges.json");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Knowledge graph edges not found" },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const edges = JSON.parse(fileContents);

    return NextResponse.json(edges, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[KG Edges] Error:", error);
    return NextResponse.json(
      { error: "Failed to load knowledge graph edges" },
      { status: 500 }
    );
  }
}
