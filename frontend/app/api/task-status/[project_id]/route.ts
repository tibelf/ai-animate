import { NextRequest, NextResponse } from 'next/server';
import { ContextManager } from '@/lib/utils/context-manager';
import { activePipelines } from '../../parse-text/route';
import type { TaskStatusResponse } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { project_id: string } }
) {
  try {
    const projectId = params.project_id;

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
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
      error: context.error,
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
