import { initialData } from '../data/initialData.js';

const STORAGE_KEY = 'skoolx_platform_state_v23'; // Versión 23: Mejoras UX de Modo Enfoque, Reanudar Lección, Atajos de Teclado, Confeti y Acordeón Inteligente

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);

      if (!parsed.courses || parsed.courses.length === 0) {
        parsed.courses = initialData.courses;
      } else {
        // Force sync modules array from initialData to guarantee strict 1 to 6 sequence
        const ehookIdx = parsed.courses.findIndex(c => c.id === 'course_ehook');
        if (ehookIdx > -1) {
          parsed.courses[ehookIdx].modules = initialData.courses[0].modules;
        } else {
          parsed.courses = initialData.courses;
        }
      }

      if (!parsed.newsPosts) {
        parsed.newsPosts = initialData.newsPosts;
      }

      if (!parsed.communityPosts) {
        parsed.communityPosts = initialData.communityPosts;
      }

      return parsed;
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }
  
  // Default save
  saveState(initialData);
  return initialData;
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

export function resetToInitial() {
  localStorage.removeItem(STORAGE_KEY);
  return initialData;
}
