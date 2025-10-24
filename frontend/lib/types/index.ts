export interface Character {
  description: string;
  candidates?: string[];
  selected_image?: string;
  lora_model?: string;
}

export interface Camera {
  type: string;
  duration_s: number;
}

export interface Scene {
  id: string;
  setting: string;
  characters: string[];
  camera: Camera;
  dialogue?: Record<string, string>;
  keyframe?: string;
  video?: string;
}

export interface ProjectContext {
  meta: {
    version: number;
    created_at: string;
    updated_at: string;
  };
  status: string;
  characters: Record<string, Character>;
  scenes: Scene[];
  final_video?: string;
  error?: string;
}

export interface ParseTextRequest {
  text: string;
}

export interface ParseTextResponse {
  project_id: string;
  status: string;
  characters: Record<string, Character>;
  scenes: Scene[];
}

export interface ConfirmCharacterRequest {
  project_id: string;
  character_name: string;
  selected_image_index: number;
}

export interface TaskStatusResponse {
  project_id: string;
  stage: string;
  progress: number;
  task: string;
  error?: string;
}

export interface ProjectContextResponse {
  project_id: string;
  context: ProjectContext;
}

export interface RollbackRequest {
  project_id: string;
  version: number;
}
