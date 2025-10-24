import { NextRequest, NextResponse } from 'next/server';
import { AnimePipeline } from '@/lib/utils/pipeline';
import { activePipelines } from '../parse-text/route';
import type { ConfirmCharacterRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmCharacterRequest = await request.json();

    if (!body.project_id || !body.character_name || body.selected_image_index === undefined) {
      return NextResponse.json(
        { error: 'Invalid request: project_id, character_name, and selected_image_index are required' },
        { status: 400 }
      );
    }

    let pipeline = activePipelines.get(body.project_id);
    if (!pipeline) {
      pipeline = new AnimePipeline(body.project_id);
      activePipelines.set(body.project_id, pipeline);
    }

    const context = await pipeline.ctx.load();
    const charData = context.characters[body.character_name];

    if (!charData) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    if (!charData.candidates || charData.candidates.length === 0) {
      return NextResponse.json(
        { error: 'No candidates available' },
        { status: 400 }
      );
    }

    if (body.selected_image_index < 0 || body.selected_image_index >= charData.candidates.length) {
      return NextResponse.json(
        { error: 'Invalid selected_image_index' },
        { status: 400 }
      );
    }

    const selectedImage = charData.candidates[body.selected_image_index];

    await pipeline.ctx.updateCharacter(
      body.character_name,
      'selected_image',
      selectedImage
    );

    return NextResponse.json({
      status: 'confirmed',
      character: body.character_name,
    });
  } catch (error) {
    console.error('Error in confirm-character:', error);
    
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
