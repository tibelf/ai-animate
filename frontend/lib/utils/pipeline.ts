import { randomUUID } from 'crypto';
import { ContextManager } from './context-manager';
import { QiniuLLMClient } from '../services/llm-client';
import type { ProjectContext } from '../types';

export interface ProgressState {
  project_id: string;
  stage: string;
  progress: number;
  task: string;
  error?: string;
}

export class AnimePipeline {
  projectId: string;
  ctx: ContextManager;
  llmClient: QiniuLLMClient;
  progress: ProgressState;

  constructor(projectId?: string) {
    this.projectId = projectId || randomUUID();
    this.ctx = new ContextManager(this.projectId);
    this.llmClient = new QiniuLLMClient();
    this.progress = {
      project_id: this.projectId,
      stage: 'initializing',
      progress: 0,
      task: '',
    };
  }

  updateProgress(stage: string, progress: number, task: string): void {
    this.progress = {
      project_id: this.projectId,
      stage,
      progress,
      task,
    };
  }

  async run(novelText: string): Promise<ProjectContext> {
    try {
      this.updateProgress('parsing_text', 10, 'Parsing novel text with LLM...');

      const result = await this.llmClient.parseNovelToScenes(novelText);

      this.updateProgress('text_parsed', 30, 'Text parsed successfully');

      const context = await this.ctx.initialize(result.characters, result.scenes);

      this.updateProgress('waiting_character_confirmation', 100, 'Waiting for character confirmation');

      return context;
    } catch (error) {
      this.progress.error = error instanceof Error ? error.message : 'Unknown error';
      this.progress.stage = 'error';
      throw error;
    }
  }

  async continueAfterCharacterConfirmation(): Promise<ProjectContext> {
    try {
      const context = await this.ctx.load();

      this.updateProgress('generating_character_images', 40, 'Generating character images...');
      await this.ctx.updateStatus('generating_character_images');

      this.updateProgress('generating_keyframes', 60, 'Generating keyframes...');
      await this.ctx.updateStatus('generating_keyframes');

      this.updateProgress('generating_videos', 80, 'Generating videos...');
      await this.ctx.updateStatus('generating_videos');

      this.updateProgress('concatenating_video', 90, 'Concatenating final video...');
      await this.ctx.updateStatus('concatenating_video');

      await this.ctx.updateStatus('completed');
      this.updateProgress('completed', 100, 'Generation completed');

      return await this.ctx.load();
    } catch (error) {
      this.progress.error = error instanceof Error ? error.message : 'Unknown error';
      this.progress.stage = 'error';
      await this.ctx.update({ error: this.progress.error } as any);
      throw error;
    }
  }

  getProgress(): ProgressState {
    return this.progress;
  }
}
