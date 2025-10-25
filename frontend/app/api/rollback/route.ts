import { NextRequest, NextResponse } from 'next/server';
import { ContextManager } from '@/lib/utils/context-manager';
import type { RollbackRequest } from '@/lib/types/index';

export async function POST(request: NextRequest) {
  try {
    const body: RollbackRequest = await request.json();

    if (!body.project_id || body.version === undefined) {
      return NextResponse.json(
        { error: 'Invalid request: project_id and version are required' },
        { status: 400 }
      );
    }

    const ctx = new ContextManager(body.project_id);
    const context = await ctx.rollback(body.version);

    return NextResponse.json({
      status: 'rolled_back',
      version: (context as any).meta?.version || 1,
    });
  } catch (error) {
    console.error('Error in rollback:', error);

    if (error instanceof Error && (error.message === 'Project not found' || error.message.includes('not found'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
