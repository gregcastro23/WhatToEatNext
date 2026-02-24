import { NextResponse } from 'next/server';

// This endpoint has been converted to a safe stub.
// The astronomy-engine fallback was removed as part of the migration to an
// internal swisseph implementation. All callers receive a 200 with empty
// positions so they can fall back to their own static defaults without crashing.

export async function POST(_request: Request) {
  return NextResponse.json(
    {
      success: true,
      positions: [],
      _celestialBodies: { all: [] },
      message: "Endpoint deprecated. Migrating to internal swisseph engine.",
    },
    { status: 200 },
  );
}

export async function GET(_request: Request) {
  return NextResponse.json(
    {
      success: true,
      positions: [],
      _celestialBodies: { all: [] },
      message: "Endpoint deprecated. Migrating to internal swisseph engine.",
    },
    { status: 200 },
  );
}
