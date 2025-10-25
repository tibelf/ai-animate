import { NextRequest, NextResponse } from 'next/server';
import { AnimePipeline } from '@/lib/utils/pipeline';
import { activePipelines } from '@/lib/pipeline-manager';

// Check both server-side and client-side env vars
function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.USE_MOCK_API === 'true';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const projectId = body.project_id;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Invalid request: project_id is required' },
        { status: 400 }
      );
    }

    // Mock mode: return mock result
    if (isMockMode()) {
      return NextResponse.json({
        status: 'generating',
        message: 'Generation started',
      });
    }

    let pipeline = activePipelines.get(projectId);
    if (!pipeline) {
      pipeline = new AnimePipeline(projectId);
      activePipelines.set(projectId, pipeline);
    }

    const result = await pipeline.continueAfterCharacterConfirmation();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in continue-generation:', error);

    if (error instanceof Error && error.message === 'Project not found') {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
