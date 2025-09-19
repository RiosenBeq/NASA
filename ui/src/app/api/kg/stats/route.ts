import { NextResponse } from "next/server";

export async function GET() {
  const stats = {
    node_types: {
      Article: 576,
      Experiment: 420,
      Project: 120,
      "Biological System": 260,
      Effect: 310
    },
    edge_relations: {
      DESCRIBES: 560,
      INVOLVES: 420,
      OBSERVES: 380,
      FUNDS: 140
    },
    node_count: 576 + 420 + 120 + 260 + 310,
    edge_count: 560 + 420 + 380 + 140
  };
  return NextResponse.json(stats);
}
