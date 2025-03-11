import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: 'API is working' });
}

export async function POST() {
  return NextResponse.json({ message: 'POST request received' });
} 