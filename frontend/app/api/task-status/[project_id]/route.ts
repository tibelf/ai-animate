import { NextRequest, NextResponse } from 'next/server';
import { ContextManager } from '@/lib/utils/context-manager';
import { activePipelines } from '@/lib/pipeline-manager';
import type { TaskStatusResponse } from '@/lib/types/index';

// Check both server-side and client-side env vars
function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.USE_MOCK_API === 'true';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = resolvedParams.project_id;

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    // Mock mode: return fake task status
    if (isMockMode()) {
      const mockResponse: TaskStatusResponse = {
        project_id: projectId,
        stage: 'completed',
        progress: 100,
        task: 'Mock generation completed',
        error: undefined,
      };
      return NextResponse.json(mockResponse);
    }

    const pipeline = activePipelines.get(projectId);
    if (pipeline) {
      const response: TaskStatusResponse = pipeline.getProgress();
      return NextResponse.json(response);
    }

    const ctx = new ContextManager(projectId);
    const context = await ctx.load();

    const response: TaskStatusResponse = {
      project_id: projectId,
      stage: context.status || 'unknown',
      progress: context.status === 'completed' ? 100 : 0,
      task: '',
      error: (context as any).error,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in task-status:', error);

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
