import { NextRequest, NextResponse } from 'next/server';
import { AnimePipeline } from '@/lib/utils/pipeline';
import type { ParseTextRequest, ParseTextResponse } from '@/lib/types';

const activePipelines = new Map<string, AnimePipeline>();

export async function POST(request: NextRequest) {
  try {
    const body: ParseTextRequest = await request.json();

    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: text is required' },
        { status: 400 }
      );
    }

    const pipeline = new AnimePipeline();
    activePipelines.set(pipeline.projectId, pipeline);

    const context = await pipeline.run(body.text);

    const response: ParseTextResponse = {
      project_id: pipeline.projectId,
      status: context.status,
      characters: context.characters,
      scenes: context.scenes,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in parse-text:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export { activePipelines };
