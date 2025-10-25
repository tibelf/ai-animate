export interface Character {
  name: string;
  description: string;
  image_candidates: string[];
  selected_image_index: number | null;
}

export interface Scene {
  description: string;
  characters: string[];
  location: string;
}

export interface ParseTextResponse {
  project_id: string;
  status: string;
  characters: Character[];
  scenes: Scene[];
}

export interface ProjectContext {
  project_id: string;
  status: string;
  current_step: number;
  characters: Character[];
  scenes: Scene[];
}

export interface ProjectContextResponse extends ProjectContext {}

export interface TaskStatusResponse {
  project_id: string;
  status: string;
  progress: number;
  current_task: string;
  completed_tasks: string[];
  pending_tasks: string[];
}
