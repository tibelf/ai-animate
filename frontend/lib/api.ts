import type {
  ParseTextResponse,
  ProjectContextResponse,
  TaskStatusResponse,
  Character,
  ProjectContext,
} from "./types";

export type { Character, ProjectContext };

const API_BASE_URL = "";

class ApiClient {
  async parseText(text: string): Promise<ParseTextResponse> {
    const response = await fetch(`${API_BASE_URL}/api/parse-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to parse text");
    }

    return response.json();
  }

  async getContext(projectId: string): Promise<ProjectContextResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/context/${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get context");
    }

    return response.json();
  }

  async confirmCharacter(
    projectId: string,
    characterName: string,
    selectedImageIndex: number
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/confirm-character`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id: projectId,
        character_name: characterName,
        selected_image_index: selectedImageIndex,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to confirm character");
    }
  }

  async continueGeneration(projectId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/continue-generation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project_id: projectId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to continue generation");
    }
  }

  async getTaskStatus(projectId: string): Promise<TaskStatusResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/task-status/${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get task status");
    }

    return response.json();
  }

  createWebSocket(projectId: string): WebSocket {
    const wsUrl = API_BASE_URL.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsUrl}/api/ws/${projectId}`);
    return ws;
  }

  async rollback(projectId: string, version: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/rollback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project_id: projectId, version }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to rollback");
    }
  }
}

export const api = new ApiClient();
