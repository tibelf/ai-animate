import { NextRequest, NextResponse } from 'next/server';
import { AnimePipeline } from '@/lib/utils/pipeline';
import { activePipelines } from '../parse-text/route';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Invalid request: project_id is required' },
        { status: 400 }
      );
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
