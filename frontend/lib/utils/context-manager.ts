import fs from 'fs/promises';
import path from 'path';
import type { ProjectContext, Character, Scene } from '../types';

export class ContextManager {
  private projectId: string;
  private contextDir: string;
  private contextPath: string;
  private historyDir: string;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.contextDir = path.join(process.cwd(), 'context', projectId);
    this.contextPath = path.join(this.contextDir, 'context.json');
    this.historyDir = path.join(this.contextDir, 'history');
  }

  async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.contextDir, { recursive: true });
    await fs.mkdir(this.historyDir, { recursive: true });
  }

  async initialize(characters: Record<string, Character>, scenes: Scene[]): Promise<ProjectContext> {
    await this.ensureDirectories();

    const context: ProjectContext = {
      meta: {
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      status: 'text_parsed',
      characters,
      scenes,
    };

    await this.save(context);
    return context;
  }

  async load(): Promise<ProjectContext> {
    try {
      const data = await fs.readFile(this.contextPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error('Project not found');
      }
      throw error;
    }
  }

  async save(context: ProjectContext): Promise<void> {
    await this.ensureDirectories();

    const existingContext = await this.load().catch(() => null);
    if (existingContext) {
      const historyFile = path.join(
        this.historyDir,
        `v${existingContext.meta.version}.json`
      );
      await fs.writeFile(historyFile, JSON.stringify(existingContext, null, 2));
    }

    context.meta.version = existingContext ? existingContext.meta.version + 1 : 1;
    context.meta.updated_at = new Date().toISOString();

    await fs.writeFile(this.contextPath, JSON.stringify(context, null, 2));
  }

  async update(updates: Partial<ProjectContext>): Promise<ProjectContext> {
    const context = await this.load();
    const updatedContext = { ...context, ...updates };
    await this.save(updatedContext);
    return updatedContext;
  }

  async updateStatus(status: string): Promise<void> {
    const context = await this.load();
    context.status = status;
    await this.save(context);
  }

  async updateCharacter(
    characterName: string,
    field: keyof Character,
    value: any
  ): Promise<void> {
    const context = await this.load();
    if (!context.characters[characterName]) {
      throw new Error(`Character ${characterName} not found`);
    }
    (context.characters[characterName] as any)[field] = value;
    await this.save(context);
  }

  async updateScene(sceneId: string, field: keyof Scene, value: any): Promise<void> {
    const context = await this.load();
    const scene = context.scenes.find((s) => s.id === sceneId);
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }
    (scene as any)[field] = value;
    await this.save(context);
  }

  async rollback(version: number): Promise<ProjectContext> {
    const historyFile = path.join(this.historyDir, `v${version}.json`);
    try {
      const data = await fs.readFile(historyFile, 'utf-8');
      const historicalContext = JSON.parse(data);
      await this.save(historicalContext);
      return historicalContext;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Version ${version} not found`);
      }
      throw error;
    }
  }

  async listHistoryVersions(): Promise<number[]> {
    try {
      const files = await fs.readdir(this.historyDir);
      return files
        .filter((f) => f.startsWith('v') && f.endsWith('.json'))
        .map((f) => parseInt(f.slice(1, -5)))
        .sort((a, b) => b - a);
    } catch (error) {
      return [];
    }
  }
}
