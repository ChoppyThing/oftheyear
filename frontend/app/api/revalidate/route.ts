import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      message: 'Endpoint removed. Use /internal/revalidate instead.',
    },
    { status: 410 },
  );
}
