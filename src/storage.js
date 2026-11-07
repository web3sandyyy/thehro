import { cleanScenario, parseScenario } from './scenario.js';
export const DRAFT_KEY='thehro.draft.v2';
export function readDraft(storage) {
  try { const raw=storage.getItem(DRAFT_KEY);return raw?parseScenario(raw):null; } catch{return null;}
}
export function writeDraft(storage,scenario) {storage.setItem(DRAFT_KEY,JSON.stringify(cleanScenario(scenario)));}
export function clearDraft(storage) {storage.removeItem(DRAFT_KEY);}
