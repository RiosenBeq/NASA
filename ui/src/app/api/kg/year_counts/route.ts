import { NextResponse } from "next/server";

export async function GET() {
  const data: Record<number, number> = {
    2008: 5,
    2010: 12,
    2012: 24,
    2014: 36,
    2016: 58,
    2018: 74,
    2020: 92,
    2022: 110,
    2024: 118
  };
  return NextResponse.json({ data });
}
