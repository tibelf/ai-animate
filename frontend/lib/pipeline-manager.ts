import { AnimePipeline } from './utils/pipeline';

// Shared pipeline manager to avoid Next.js route export issues
export const activePipelines = new Map<string, AnimePipeline>();