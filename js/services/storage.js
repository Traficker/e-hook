import { initialData } from '../data/initialData.js';

const STORAGE_KEY = 'skoolx_platform_state_v6';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);

      // Preserve user changes & merge missing initial data gracefully
      if (!parsed.courses || parsed.courses.length === 0) {
        parsed.courses = initialData.courses;
      } else {
        // Ensure new modules or initial lessons exist without overwriting user edits
        initialData.courses.forEach(initCourse => {
          let courseInState = parsed.courses.find(c => c.id === initCourse.id);
          if (!courseInState) {
            parsed.courses.push(initCourse);
          } else {
            initCourse.modules.forEach(initMod => {
              let modInState = courseInState.modules.find(m => m.id === initMod.id);
              if (!modInState) {
                courseInState.modules.push(initMod);
              } else {
                initMod.lessons.forEach(initLesson => {
                  let lessonInState = modInState.lessons.find(l => l.id === initLesson.id);
                  if (!lessonInState) {
                    modInState.lessons.push(initLesson);
                  }
                });
              }
            });
          }
        });
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
