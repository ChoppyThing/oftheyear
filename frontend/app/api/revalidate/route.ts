import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const path = searchParams.get('path');

  // Vérifier le secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  // Vérifier que le path est fourni
  if (!path) {
    return NextResponse.json({ message: 'Missing path parameter' }, { status: 400 });
  }

  try {
    // Revalider le path spécifié
    revalidatePath(path);
    
    return NextResponse.json({ 
      revalidated: true, 
      path,
      now: Date.now() 
    });
  } catch (err) {
    return NextResponse.json({ 
      message: 'Error revalidating',
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
