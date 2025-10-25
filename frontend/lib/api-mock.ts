import type {
  ParseTextResponse,
  ProjectContextResponse,
  TaskStatusResponse,
} from "./types";
import { mockCharacters } from "./mock-data/characters";

class MockApiClient {
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async parseText(text: string): Promise<ParseTextResponse> {
    await this.delay(800);
    
    const projectId = `novel_${Date.now()}`;
    return {
      project_id: projectId,
      status: 'pending_character_confirmation',
      characters: mockCharacters['novel_2025_001'].map(char => ({
        name: char.name,
        description: char.description,
        image_candidates: char.candidates,
        selected_image_index: null,
      })),
      scenes: [],
    };
  }

  async getContext(projectId: string): Promise<ProjectContextResponse> {
    await this.delay(300);
    
    const characters: any = {};
    mockCharacters['novel_2025_001'].forEach(char => {
      characters[char.name] = {
        description: char.description,
        image_prompt: char.prompt,
        candidates: char.candidates,
        selected_image_index: char.selectedIndex,
      };
    });
    
    return {
      context: {
        project_id: projectId,
        status: 'in_progress',
        characters,
        scenes: {},
        novel_text: '夕阳西下，校园操场上...',
      }
    };
  }

  async confirmCharacter(
    projectId: string,
    characterName: string,
    selectedImageIndex: number
  ): Promise<void> {
    await this.delay(500);
    console.log('[MOCK] Confirmed character:', { projectId, characterName, selectedImageIndex });
  }

  async continueGeneration(projectId: string): Promise<void> {
    await this.delay(500);
    console.log('[MOCK] Continue generation:', projectId);
  }

  async getTaskStatus(projectId: string): Promise<TaskStatusResponse> {
    await this.delay(200);
    
    return {
      project_id: projectId,
      status: 'in_progress',
      progress: Math.floor(Math.random() * 100),
      current_task: '正在生成角色图像...',
      completed_tasks: ['解析小说内容', '提取角色信息'],
      pending_tasks: ['生成场景图像', '合成视频'],
    };
  }

  createWebSocket(projectId: string): WebSocket {
    console.log('[MOCK] WebSocket created for:', projectId);
    return new WebSocket('ws://localhost:9999');
  }

  async rollback(projectId: string, version: number): Promise<void> {
    await this.delay(500);
    console.log('[MOCK] Rollback:', { projectId, version });
  }
}

export const mockApi = new MockApiClient();
