import { NextRequest, NextResponse } from 'next/server';
import { AnimePipeline } from '@/lib/utils/pipeline';
import { activePipelines } from '@/lib/pipeline-manager';
import type { ParseTextRequest, ParseTextResponse } from '@/lib/types/index';

// Check both server-side and client-side env vars
function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.USE_MOCK_API === 'true';
}

export async function POST(request: NextRequest) {
  try {
    const body: ParseTextRequest = await request.json();

    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: text is required' },
        { status: 400 }
      );
    }

    // Mock mode: return fake data
    if (isMockMode()) {
      const projectId = `mock_${Date.now()}`;
      const response: ParseTextResponse = {
        project_id: projectId,
        status: 'text_parsed',
        characters: {
          '小明': {
            description: '一个阳光开朗的高中生，短发，戴眼镜',
            candidates: [
              'https://picsum.photos/400/600?random=1',
              'https://picsum.photos/400/600?random=2',
              'https://picsum.photos/400/600?random=3',
            ],
          },
          '小红': {
            description: '温柔的女孩，长发，爱读书',
            candidates: [
              'https://picsum.photos/400/600?random=4',
              'https://picsum.photos/400/600?random=5',
              'https://picsum.photos/400/600?random=6',
            ],
          },
        },
        scenes: [
          {
            id: 'scene_01',
            setting: '阳光明媚的早晨，教室里',
            characters: ['小明'],
            camera: { type: 'push_in', duration_s: 3 },
          },
          {
            id: 'scene_02',
            setting: '教室，小红正在看书',
            characters: ['小红'],
            camera: { type: 'close_up', duration_s: 2 },
          },
          {
            id: 'scene_03',
            setting: '小明和小红对话',
            characters: ['小明', '小红'],
            camera: { type: 'wide_shot', duration_s: 5 },
            dialogue: { '小明': '早上好！' },
          },
        ],
      };
      return NextResponse.json(response);
    }

    // Production mode: use real LLM
    const pipeline = new AnimePipeline();
    activePipelines.set(pipeline.projectId, pipeline);

    const context = await pipeline.run(body.text);

    const response: ParseTextResponse = {
      project_id: pipeline.projectId,
      status: context.status,
      characters: context.characters as any,
      scenes: context.scenes as any,
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

// Export moved to separate module to avoid Next.js route export issues
// activePipelines is now managed in a separate shared module
