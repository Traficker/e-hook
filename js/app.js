import { loadState, saveState, resetToInitial } from './services/storage.js';
import { renderVideoContainer } from './utils/video.js';

class SkoolApp {
  constructor() {
    this.state = loadState();
    this.currentTab = 'classroom'; // 'community', 'classroom', 'leaderboard', 'admin'
    this.selectedCourseId = 'course_ehook';
    this.selectedModuleId = 'mod_1';
    this.selectedLessonId = 'm1_l1';
    this.quizAnswers = {};
    this.isEditingLesson = null; // Lesson object being edited in admin mode
    this.isCreatingLessonInModule = null;
    this.searchQuery = '';
    this.searchActive = false;

    this.init();
  }

  init() {
    this.render();
    this.attachGlobalListeners();
  }

  // --- State Persistence & Helpers ---
  updateState(fn) {
    fn(this.state);
    saveState(this.state);
    this.render();
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // --- XP & Gamification ---
  addXP(amount) {
    this.state.currentUser.xp += amount;
    // Level calculation (Every 200 XP = 1 Level)
    const newLevel = Math.floor(this.state.currentUser.xp / 200) + 1;
    if (newLevel > this.state.currentUser.level) {
      this.state.currentUser.level = newLevel;
      this.showToast(`🎉 ¡Felicidades! Subiste al Nivel ${newLevel}`, 'success');
    } else {
      this.showToast(`+${amount} Puntos XP ganados!`, 'success');
    }
    saveState(this.state);
  }

  // --- Main Render Engine ---
  render() {
    const appEl = document.getElementById('app');
    appEl.innerHTML = `
      ${this.renderHeader()}
      <main class="main-content">
        ${this.renderActiveTab()}
      </main>
    `;

    // Re-initialize Lucide Icons after DOM update
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- Header & Navigation Bar ---
  renderHeader() {
    const { currentUser } = this.state;
    const isAdmin = currentUser.role === 'admin';

    return `
      <header class="header-navbar">
        <div class="nav-brand" onclick="window.app.switchTab('classroom')">
          <div class="brand-logo">EH</div>
          <h1 class="brand-title">E-<span>hook</span></h1>
        </div>

        <!-- Buscador global por palabras clave -->
        <div class="header-search-container">
          <div class="search-input-wrapper">
            <i data-lucide="search" style="position:absolute; left:12px; width:16px; height:16px; color:var(--text-muted); pointer-events:none;"></i>
            <input type="text"
                   id="global-search-input"
                   class="form-control"
                   placeholder="🔍 Buscar tema, lección o concepto..."
                   value="${this.searchQuery || ''}"
                   oninput="window.app.handleSearchInput(this.value)"
                   onfocus="window.app.handleSearchFocus()" />
            ${this.searchQuery ? `
              <button type="button" onclick="window.app.clearSearch()" style="position:absolute; right:10px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.1rem; line-height:1;">✕</button>
            ` : ''}
          </div>

          <!-- Resultados desplegables -->
          <div id="search-results-dropdown" class="search-results-dropdown" style="display:${this.searchActive ? 'block' : 'none'};">
            ${this.renderSearchResultsHTML()}
          </div>
        </div>

        <nav class="nav-tabs">
          <button class="tab-btn ${this.currentTab === 'classroom' ? 'active' : ''}" onclick="window.app.switchTab('classroom')">
            <i data-lucide="book-open"></i> Aulas / Cursos
          </button>
          <button class="tab-btn ${this.currentTab === 'news' ? 'active' : ''}" onclick="window.app.switchTab('news')">
            <i data-lucide="newspaper"></i> Noticias
          </button>
          <button class="tab-btn ${this.currentTab === 'community' ? 'active' : ''}" onclick="window.app.switchTab('community')">
            <i data-lucide="message-square"></i> Comunidad
          </button>
          <button class="tab-btn ${this.currentTab === 'leaderboard' ? 'active' : ''}" onclick="window.app.switchTab('leaderboard')">
            <i data-lucide="trophy"></i> Clasificación
          </button>
          ${isAdmin ? `
            <button class="tab-btn ${this.currentTab === 'admin' ? 'active' : ''}" onclick="window.app.switchTab('admin')">
              <i data-lucide="settings"></i> Administración
            </button>
          ` : ''}
        </nav>

        <div class="nav-right">
          <div class="user-xp-badge">
            <span class="level-indicator">Nivel ${currentUser.level}</span>
            <span class="xp-amount">⚡ ${currentUser.xp} XP</span>
          </div>

          <div class="role-switcher" onclick="window.app.toggleUserRole()" title="Haz clic para cambiar entre Estudiante y Administrador">
            <span class="role-pill ${!isAdmin ? 'active' : ''}">Estudiante</span>
            <span class="role-pill ${isAdmin ? 'active' : ''}">Admin</span>
          </div>

          <button class="theme-toggle-btn" onclick="window.app.toggleTheme()" title="Cambiar tema">
            <i data-lucide="moon"></i>
          </button>
        </div>
      </header>
    `;
  }

  renderActiveTab() {
    switch (this.currentTab) {
      case 'classroom':
        return this.renderClassroom();
      case 'news':
        return this.renderNews();
      case 'community':
        return this.renderCommunity();
      case 'leaderboard':
        return this.renderLeaderboard();
      case 'admin':
        return this.renderAdminPanel();
      default:
        return this.renderClassroom();
    }
  }

  // ==========================================================================
  // CLASSROOM & LESSON VIEWER ("Ir de uno en uno")
  // ==========================================================================

  renderClassroom() {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId) || this.state.courses[0];
    if (!course) return '<p>No hay cursos disponibles.</p>';

    // If user has chosen a specific lesson view inside a course
    if (this.selectedLessonId) {
      return this.renderLessonViewer(course);
    }

    // Default Course Directory
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedCount = this.state.currentUser.completedLessons.length;
    const progressPct = Math.min(100, Math.round((completedCount / (totalLessons || 1)) * 100));

    return `
      <div class="courses-header">
        <div>
          <h1>Catálogo de Cursos</h1>
          <p>Aprende paso a paso con lecciones en video embebido y evaluaciones prácticas.</p>
        </div>
      </div>

      <div class="courses-grid">
        <div class="course-card" onclick="window.app.selectCourse('${course.id}')">
          <img src="${course.coverUrl}" alt="${course.title}" class="course-banner-img" />
          <div class="course-card-body">
            <div class="course-badges">
              <span class="badge-tag">${course.badge}</span>
              <span class="badge-tag" style="background: rgba(16,185,129,0.15); color: var(--success); border-color: rgba(16,185,129,0.3);">
                ${totalLessons} Lecciones
              </span>
            </div>
            <h3 class="course-card-title">${course.title}</h3>
            <p class="course-card-desc">${course.subtitle}</p>

            <div class="progress-container">
              <div class="progress-header">
                <span>Tu Progreso</span>
                <span>${progressPct}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${progressPct}%"></div>
              </div>
            </div>

            <button class="btn-enter-course">
              <i data-lucide="play-circle"></i> Entrar al Curso
            </button>
          </div>
        </div>
      </div>
    `;
  }

  showLockedToast() {
    this.showToast('🔒 Lección bloqueada. Marca la lección anterior como completada o aprueba el examen para desbloquear.', 'warning');
  }

  renderLessonViewer(course) {
    const isAdmin = this.state.currentUser.role === 'admin';
    const completedSet = new Set(this.state.currentUser.completedLessons || []);

    let currentModule = null;
    let currentLesson = null;
    let flatLessonsList = [];

    course.modules.forEach(mod => {
      mod.lessons.forEach(l => {
        flatLessonsList.push({ module: mod, lesson: l });
        if (l.id === this.selectedLessonId) {
          currentModule = mod;
          currentLesson = l;
        }
      });
    });

    // Calcular mapa de lecciones desbloqueadas
    const unlockedMap = {};
    flatLessonsList.forEach((item, idx) => {
      if (idx === 0 || isAdmin) {
        unlockedMap[item.lesson.id] = true;
      } else {
        const prevId = flatLessonsList[idx - 1].lesson.id;
        unlockedMap[item.lesson.id] = completedSet.has(prevId);
      }
    });

    // Si la lección seleccionada estuviera bloqueada (en cambio de rol), cambiar a la última desbloqueada
    if (!currentLesson || !unlockedMap[currentLesson.id]) {
      const available = flatLessonsList.filter(item => unlockedMap[item.lesson.id]);
      const lastUnlocked = available[available.length - 1] || flatLessonsList[0];
      currentModule = lastUnlocked.module;
      currentLesson = lastUnlocked.lesson;
      this.selectedLessonId = currentLesson.id;
    }

    const currentIndex = flatLessonsList.findIndex(item => item.lesson.id === currentLesson.id);
    const prevItem = currentIndex > 0 ? flatLessonsList[currentIndex - 1] : null;
    const nextItem = currentIndex < flatLessonsList.length - 1 ? flatLessonsList[currentIndex + 1] : null;

    const isCompleted = completedSet.has(currentLesson.id);
    const nextUnlocked = nextItem ? unlockedMap[nextItem.lesson.id] : false;

    return `
      <div class="lesson-layout">
        <!-- Sidebar Accordion of Modules & Lessons -->
        <aside class="modules-sidebar">
          <div class="sidebar-title">
            <span>Módulos del Curso</span>
            <button class="back-to-courses-btn" onclick="window.app.clearLessonSelection()">
              <i data-lucide="grid"></i> Ver Cursos
            </button>
          </div>

          <div class="modules-accordion">
            ${course.modules.map((mod, modIdx) => `
              <div class="module-accordion-item">
                <div class="module-accordion-header" onclick="window.app.toggleModuleDrawer('${mod.id}')">
                  <span>${mod.title}</span>
                  <i data-lucide="chevron-down" style="width:16px;"></i>
                </div>
                <div class="module-accordion-body" id="drawer-${mod.id}">
                  ${mod.lessons.map(l => {
                    const lDone = completedSet.has(l.id);
                    const lUnlocked = unlockedMap[l.id];
                    const lActive = l.id === currentLesson.id;
                    return `
                      <div class="sidebar-lesson-item ${lActive ? 'active' : ''} ${lDone ? 'completed' : ''} ${!lUnlocked ? 'locked' : ''}"
                           onclick="${lUnlocked ? `window.app.selectLesson('${mod.id}', '${l.id}')` : `window.app.showLockedToast()`}">
                        <div class="lesson-status-icon">
                          ${lDone ? '✓' : (!lUnlocked ? '🔒' : '')}
                        </div>
                        <span style="flex:1;">${l.title}</span>
                        ${l.type === 'quiz' ? '<span style="font-size:0.7rem; font-weight:700; color:var(--warning);">QUIZ</span>' : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </aside>

        <!-- Main Display -->
        <section class="lesson-main-display">
          <div class="lesson-header-bar">
            <div>
              <span class="lesson-meta-module">${currentModule.title}</span>
              <h1 class="lesson-main-title">${currentLesson.title}</h1>
            </div>
            ${this.state.currentUser.role === 'admin' ? `
              <button class="btn-nav-step" onclick="window.app.openEditLessonModal('${currentLesson.id}')" style="border-color:var(--warning); color:var(--warning);">
                <i data-lucide="edit-3"></i> Editar Lección / Video URL
              </button>
            ` : ''}
          </div>

          <p class="lesson-summary-p">${currentLesson.summary || ''}</p>

          <!-- Embedded Video Player Box(es) (Oculto si no hay videos) -->
          ${(() => {
            const videos = this._getLessonVideos(currentLesson);
            if (currentLesson.type === 'quiz' || videos.length === 0) return '';
            return `
              <div class="lesson-videos-container" style="display:flex; flex-direction:column; gap:1.5rem; margin-bottom:2rem;">
                ${videos.map((vUrl, idx) => `
                  <div>
                    ${videos.length > 1 ? `<div style="font-weight:700; font-size:0.95rem; margin-bottom:8px; color:var(--accent-primary);">🎥 Video ${idx + 1} de la Lección</div>` : ''}
                    ${renderVideoContainer(vUrl, videos.length > 1 ? `${currentLesson.title} - Video ${idx + 1}` : currentLesson.title)}
                  </div>
                `).join('')}
              </div>
            `;
          })()}

          <!-- Embedded PDF Viewer (Oculto si no hay PDFs de Google Drive) -->
          ${(() => {
            const pdfs = this._getLessonPdfs(currentLesson);
            if (currentLesson.type === 'quiz' || pdfs.length === 0) return '';
            return `
              <div class="lesson-pdfs-container" style="display:flex; flex-direction:column; gap:1.5rem; margin-bottom:2rem;">
                ${pdfs.map((pUrl, idx) => {
                  const embedUrl = this._parsePdfUrl(pUrl);
                  if (!embedUrl) return '';
                  return `
                    <div class="pdf-viewer-box">
                      <div class="pdf-viewer-header">
                        <div style="display:flex; align-items:center; gap:8px;">
                          <span style="font-size:1.25rem;">📄</span>
                          <div>
                            <div style="font-weight:700; font-size:0.95rem; color:var(--text-main);">${pdfs.length > 1 ? `Recurso PDF ${idx + 1}` : 'Recurso PDF de la Lección'}</div>
                            <div style="font-size:0.78rem; color:var(--text-muted);">Visualización incrustada desde Google Drive</div>
                          </div>
                        </div>
                        <a href="${pUrl}" target="_blank" rel="noopener noreferrer" class="btn-download-pdf">
                          ⬇️ Descargar PDF
                        </a>
                      </div>
                      <div class="pdf-iframe-wrapper">
                        <iframe src="${embedUrl}" allowfullscreen loading="lazy"></iframe>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          })()}

          <!-- Rich Text Content or Quiz -->
          ${currentLesson.type === 'quiz' ? this.renderQuiz(currentLesson) : `
            <div class="lesson-rich-content">
              ${currentLesson.contentHTML || '<p>Contenido de la lección.</p>'}
            </div>

            ${currentLesson.checklist && currentLesson.checklist.length > 0 ? `
              <div class="checklist-section">
                <h4 class="checklist-title">
                  <i data-lucide="check-square" style="color:var(--accent-primary);"></i> Checklist de Acción Práctica
                </h4>
                ${currentLesson.checklist.map((item, idx) => `
                  <label class="checklist-item">
                    <input type="checkbox" class="checklist-checkbox" id="chk-${currentLesson.id}-${idx}" />
                    <span>${item}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}
          `}

          <!-- Step-by-Step Navigation Bar ("Ir de uno en uno") -->
          <div class="lesson-nav-actions">
            <button class="btn-nav-step" ${!prevItem ? 'disabled' : ''} 
                    onclick="${prevItem ? `window.app.selectLesson('${prevItem.module.id}', '${prevItem.lesson.id}')` : ''}">
              <i data-lucide="arrow-left"></i> Lección Anterior
            </button>

            <button class="btn-complete-lesson ${isCompleted ? 'completed' : ''}"
                    onclick="window.app.toggleCompleteLesson('${currentLesson.id}')">
              <i data-lucide="${isCompleted ? 'check-circle' : 'circle'}"></i>
              ${isCompleted ? 'Lección Completada' : 'Marcar como Completado (+50 XP)'}
            </button>

            <button class="btn-nav-step" ${!nextItem ? 'disabled' : ''}
                    onclick="${nextItem ? (nextUnlocked ? `window.app.selectLesson('${nextItem.module.id}', '${nextItem.lesson.id}')` : `window.app.showLockedToast()`) : ''}">
              Siguiente Lección ${!nextUnlocked && nextItem ? '🔒' : ''} <i data-lucide="arrow-right"></i>
            </button>
          </div>
        </section>
      </div>
    `;
  }

  // --- Quiz Renderer ---
  renderQuiz(quizLesson) {
    const isPassed = this.state.currentUser.passedQuizzes[quizLesson.id];

    if (isPassed) {
      return `
        <div class="quiz-result-modal">
          <div style="font-size:3rem;">🏆</div>
          <h2>¡Evaluación Aprobada!</h2>
          <p>Has obtenido el certificado de conocimiento para este módulo.</p>
          <div class="score-badge">100%</div>
          <button class="btn-primary-action" onclick="window.app.resetQuiz('${quizLesson.id}')">Volver a intentar el Quiz</button>
        </div>
      `;
    }

    return `
      <div class="quiz-container">
        <div class="callout callout-accent" style="margin-top:0;">
          <h4>📝 Evaluación del Módulo</h4>
          <p>Responde las siguientes preguntas. Se requiere un puntaje mínimo de ${quizLesson.minScore || 70}% para aprobar y ganar +100 XP.</p>
        </div>

        <form id="quiz-form" onsubmit="window.app.submitQuiz(event, '${quizLesson.id}')">
          ${quizLesson.questions.map((q, qIdx) => `
            <div class="quiz-question-card">
              <div class="quiz-question-text">${q.question}</div>
              <div class="quiz-options-list">
                ${q.options.map((opt, optIdx) => `
                  <label class="quiz-option-label">
                    <input type="radio" name="q_${q.id}" value="${optIdx}" class="quiz-option-radio" required />
                    <span>${opt}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}

          <button type="submit" class="btn-submit-quiz">Enviar Respuestas y Calificar</button>
        </form>
      </div>
    `;
  }

  submitQuiz(e, quizId) {
    e.preventDefault();
    const course = this.state.courses.find(c => c.id === this.selectedCourseId);
    let quizLesson = null;
    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        if (l.id === quizId) quizLesson = l;
      });
    });

    if (!quizLesson) return;

    const formData = new FormData(e.target);
    let correctCount = 0;

    quizLesson.questions.forEach(q => {
      const selected = parseInt(formData.get(`q_${q.id}`));
      if (selected === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / quizLesson.questions.length) * 100);

    if (scorePct >= (quizLesson.minScore || 70)) {
      this.updateState(state => {
        state.currentUser.passedQuizzes[quizId] = scorePct;
        if (!state.currentUser.completedLessons.includes(quizId)) {
          state.currentUser.completedLessons.push(quizId);
        }
      });
      this.addXP(100);
      this.showToast(`🎉 ¡Aprobaste la evaluación con ${scorePct}%!`, 'success');
    } else {
      this.showToast(`Obtuviste ${scorePct}%. Revisa el material e inténtalo de nuevo.`, 'warning');
    }
  }

  resetQuiz(quizId) {
    this.updateState(state => {
      delete state.currentUser.passedQuizzes[quizId];
    });
  }

  // --- Lesson Navigation Methods ---
  selectCourse(courseId) {
    this.selectedCourseId = courseId;
    const course = this.state.courses.find(c => c.id === courseId);
    if (course && course.modules.length > 0) {
      this.selectedModuleId = course.modules[0].id;
      this.selectedLessonId = course.modules[0].lessons[0].id;
    }
    this.render();
  }

  selectLesson(moduleId, lessonId) {
    this.selectedModuleId = moduleId;
    this.selectedLessonId = lessonId;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearLessonSelection() {
    this.selectedLessonId = null;
    this.render();
  }

  toggleCompleteLesson(lessonId) {
    this.updateState(state => {
      const idx = state.currentUser.completedLessons.indexOf(lessonId);
      if (idx > -1) {
        state.currentUser.completedLessons.splice(idx, 1);
      } else {
        state.currentUser.completedLessons.push(lessonId);
        this.addXP(50);
      }
    });
  }

  // ==========================================================================
  // NEWS & ANNOUNCEMENTS VIEW ("Pestaña de Noticias")
  // ==========================================================================

  renderNews() {
    const isAdmin = this.state.currentUser.role === 'admin';
    const posts = this.state.newsPosts || [];

    // Sort: Pinned posts first
    const sortedPosts = [...posts].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    return `
      <div class="news-layout">
        <!-- Header del Canal de Noticias -->
        <div class="news-banner-card">
          <div class="flex-between">
            <div>
              <span class="badge-tag" style="background:rgba(99,102,241,0.2); color:var(--accent-primary);">📰 Canal Oficial de Novedades</span>
              <h1 style="font-size:1.8rem; margin:6px 0;">Noticias & Anuncios de los Cursos</h1>
              <p style="color:var(--text-muted); font-size:0.95rem;">Mantente al día con los últimos avisos, actualizaciones de lecciones y novedades de la plataforma.</p>
            </div>
            ${isAdmin ? `
              <button class="btn-primary-action" onclick="window.app.openCreateNewsModal()" style="padding:12px 20px; font-size:0.95rem; white-space:nowrap;">
                ➕ Publicar Nueva Noticia
              </button>
            ` : ''}
          </div>
        </div>

        <!-- News Feed Grid -->
        <div class="news-feed-grid">
          ${sortedPosts.length === 0 ? `
            <div class="admin-panel-card" style="text-align:center; padding:3rem; grid-column: 1 / -1;">
              <div style="font-size:2.5rem; margin-bottom:1rem;">📰</div>
              <h3>No hay noticias publicadas aún</h3>
              <p style="color:var(--text-muted);">El administrador publicará noticias y avisos pronto.</p>
            </div>
          ` : sortedPosts.map(news => {
            const parsedVideo = news.videoUrl ? (window._parseVideoUrl || (() => null))(news.videoUrl) : null;

            return `
              <article class="news-card ${news.isPinned ? 'pinned' : ''}">
                ${parsedVideo && parsedVideo.embedUrl ? `
                  <div style="position:relative; padding-bottom:56.25%; background:#000; overflow:hidden;">
                    <iframe src="${parsedVideo.embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen loading="lazy"></iframe>
                  </div>
                ` : (news.coverUrl ? `
                  <div class="news-cover-wrapper">
                    <img src="${news.coverUrl}" alt="${news.title}" class="news-cover-img" />
                  </div>
                ` : '')}

                <div class="news-card-body">
                  <div class="news-card-header">
                    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                      ${news.isPinned ? '<span class="news-badge-pinned">📌 Destacado</span>' : ''}
                      ${parsedVideo ? '<span class="news-badge-category" style="background:rgba(239,68,68,0.2); color:#f87171; border-color:rgba(239,68,68,0.4);">🎥 Video Anuncio</span>' : ''}
                      <span class="news-badge-category">${news.category || 'Anuncio'}</span>
                    </div>
                    <span class="news-date">${news.date}</span>
                  </div>

                  <h2 class="news-card-title">${news.title}</h2>

                  <div class="news-author-row">
                    <img src="${news.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}" class="news-author-avatar" alt="${news.author}" />
                    <span>Publicado por <strong>${news.author}</strong></span>
                  </div>

                  <div class="news-content-p">
                    ${(news.content || '').replace(/\n/g, '<br>')}
                  </div>

                  ${isAdmin ? `
                    <div class="news-admin-actions">
                      <button class="btn-nav-step" style="padding:6px 12px; font-size:0.8rem;" onclick="window.app.openEditNewsModal('${news.id}')">
                        ✏️ Editar
                      </button>
                      <button class="btn-nav-step" style="padding:6px 12px; font-size:0.8rem; border-color:var(--warning); color:var(--warning);" onclick="window.app.togglePinNews('${news.id}')">
                        ${news.isPinned ? '📌 Quitar Destacado' : '📌 Destacar al Inicio'}
                      </button>
                      <button class="btn-danger-action" style="padding:6px 12px; font-size:0.8rem;" onclick="window.app.deleteNewsPost('${news.id}')">
                        🗑️ Eliminar
                      </button>
                    </div>
                  ` : ''}
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  openCreateNewsModal() {
    this._showNewsModalHTML(null);
  }

  openEditNewsModal(newsId) {
    const target = (this.state.newsPosts || []).find(n => n.id === newsId);
    if (!target) return;
    this._showNewsModalHTML(target);
  }

  _showNewsModalHTML(news = null) {
    const isEdit = !!news;
    const existing = document.getElementById('news-modal-overlay');
    if (existing) existing.remove();

    const root = document.getElementById('admin-modal-root') || document.body;
    const modalWrapper = document.createElement('div');
    modalWrapper.id = 'news-modal-overlay';
    modalWrapper.innerHTML = `
      <div style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem;">
        <div class="admin-panel-card" style="width:100%; max-width:650px; max-height:90vh; overflow-y:auto;">
          <div class="flex-between" style="margin-bottom:1.5rem;">
            <h2>${isEdit ? '✏️ Editar Noticia' : '➕ Publicar Nueva Noticia'}</h2>
            <button type="button" onclick="document.getElementById('news-modal-overlay').remove()" style="background:none;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer;">✕</button>
          </div>

          <form onsubmit="window.app.handleSaveNews(event, ${isEdit ? `'${news.id}'` : 'null'})">
            <div class="form-group">
              <label>📝 Título de la Noticia o Anuncio</label>
              <input type="text" name="title" class="form-control" placeholder="Ej: 🚀 ¡Nuevo Módulo disponible la próxima semana!" value="${news?.title || ''}" required />
            </div>

            <div class="form-group">
              <label>🏷️ Categoría de la Noticia</label>
              <select name="category" class="form-control" required>
                <option value="📢 Anuncio Oficial"${news?.category === '📢 Anuncio Oficial' ? ' selected' : ''}>📢 Anuncio Oficial</option>
                <option value="🎉 Novedad"${news?.category === '🎉 Novedad' ? ' selected' : ''}>🎉 Novedad</option>
                <option value="🚀 Lanzamiento"${news?.category === '🚀 Lanzamiento' ? ' selected' : ''}>🚀 Lanzamiento</option>
                <option value="⚠️ Importante"${news?.category === '⚠️ Importante' ? ' selected' : ''}>⚠️ Importante</option>
              </select>
            </div>

            <div class="form-group">
              <label>🎥 Enlace de Video (YouTube / Vimeo) <span style="color:var(--text-muted); font-weight:400;">(Opcional)</span></label>
              <input type="text" name="videoUrl" class="form-control" placeholder="https://www.youtube.com/watch?v=..." value="${news?.videoUrl || ''}" />
              <small style="color:var(--text-muted);">Si pegas un enlace de video, se incrustará un reproductor interactivo en la tarjeta de noticia.</small>
            </div>

            <div class="form-group">
              <label>🖼️ URL de Imagen de Portada <span style="color:var(--text-muted); font-weight:400;">(Opcional si no usas video)</span></label>
              <input type="text" name="coverUrl" class="form-control" placeholder="https://images.unsplash.com/photo-..." value="${news?.coverUrl || ''}" />
            </div>

            <div class="form-group">
              <label>📖 Contenido completo del aviso</label>
              <textarea name="content" class="form-control" style="height:150px;" placeholder="Escribe la información detallada que quieres comunicar a los estudiantes..." required>${news?.content || ''}</textarea>
            </div>

            <div class="form-group" style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" name="isPinned" id="news-pinned-check" ${news?.isPinned ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" />
              <label for="news-pinned-check" style="margin-bottom:0; cursor:pointer; font-weight:600;">📌 Fijar esta noticia al inicio de la página</label>
            </div>

            <div class="flex-between" style="margin-top:1.5rem;">
              <button type="button" class="btn-nav-step" onclick="document.getElementById('news-modal-overlay').remove()">Cancelar</button>
              <button type="submit" class="btn-primary-action" style="padding:12px 28px;">
                ${isEdit ? '💾 Guardar Cambios' : '📢 Publicar Noticia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    root.appendChild(modalWrapper);
    if (window.lucide) window.lucide.createIcons();
  }

  handleSaveNews(e, newsId) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const category = formData.get('category');
    const videoUrl = formData.get('videoUrl');
    const coverUrl = formData.get('coverUrl');
    const content = formData.get('content');
    const isPinned = e.target.querySelector('#news-pinned-check').checked;

    const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    this.updateState(state => {
      if (!state.newsPosts) state.newsPosts = [];

      if (newsId) {
        const item = state.newsPosts.find(n => n.id === newsId);
        if (item) {
          item.title = title;
          item.category = category;
          item.videoUrl = videoUrl;
          item.coverUrl = coverUrl;
          item.content = content;
          item.isPinned = isPinned;
        }
      } else {
        state.newsPosts.unshift({
          id: `news_${Date.now()}`,
          title,
          category,
          date: today,
          isPinned,
          author: `${this.state.currentUser.name} (Admin)`,
          avatar: this.state.currentUser.avatar,
          videoUrl,
          coverUrl,
          content
        });
      }
    });

    const overlay = document.getElementById('news-modal-overlay');
    if (overlay) overlay.remove();
    this.showToast(newsId ? '💾 Noticia actualizada' : '📢 Noticia publicada con éxito', 'success');
  }

  togglePinNews(newsId) {
    this.updateState(state => {
      const item = (state.newsPosts || []).find(n => n.id === newsId);
      if (item) item.isPinned = !item.isPinned;
    });
    this.showToast('📌 Estado de la noticia actualizado', 'info');
  }

  deleteNewsPost(newsId) {
    if (!confirm('¿Seguro que deseas eliminar esta noticia?')) return;
    this.updateState(state => {
      state.newsPosts = (state.newsPosts || []).filter(n => n.id !== newsId);
    });
    this.showToast('🗑️ Noticia eliminada', 'info');
  }

  // ==========================================================================
  // COMMUNITY VIEW & USER REPLIES
  // ==========================================================================

  renderCommunity() {
    return `
      <div class="community-layout">
        <div>
          <!-- Create Post Box -->
          <div class="create-post-box">
            <h3>💬 Crear Publicación en la Comunidad</h3>
            <form onsubmit="window.app.handleCreatePost(event)">
              <input type="text" name="title" class="form-control" placeholder="Título de la publicación..." required style="margin-top:10px;" />
              <textarea name="content" class="post-input-textarea" placeholder="¿Qué pregunta o aprendizaje quieres compartir hoy con los compañeros?" required></textarea>
              <div class="flex-between">
                <select name="category" class="form-control" style="width:200px;">
                  <option value="Dudas de Cursos">Dudas de Cursos</option>
                  <option value="General">General</option>
                  <option value="Caso de Éxito">Caso de Éxito</option>
                </select>
                <button type="submit" class="btn-primary-action">Publicar (+20 XP)</button>
              </div>
            </form>
          </div>

          <!-- Feed Posts -->
          <div class="posts-feed">
            ${this.state.communityPosts.map(post => {
              const commentsCount = (post.comments || []).reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);

              return `
                <div class="post-card">
                  <div class="post-header">
                    <img src="${post.authorAvatar}" class="post-avatar" alt="${post.authorName}" />
                    <div>
                      <div class="post-author-name">${post.authorName}</div>
                      <div class="post-time">${post.time} • <span style="color:var(--accent-primary);">${post.category}</span></div>
                    </div>
                  </div>

                  <h3 class="post-title">${post.title}</h3>
                  <p style="line-height:1.5; color:var(--text-main);">${post.content}</p>

                  <div class="post-actions">
                    <button class="btn-action-like" onclick="window.app.likePost('${post.id}')">
                      <i data-lucide="thumbs-up"></i> ${post.likes} Me gusta
                    </button>
                    <button class="btn-action-like">
                      <i data-lucide="message-circle"></i> ${commentsCount} Respuestas
                    </button>
                  </div>

                  <!-- Secciones de Comentarios y Respuestas de Usuario a Usuario -->
                  <div class="post-comments-section">
                    <h4 style="font-size:0.9rem; font-weight:700; margin-bottom:12px; color:var(--text-muted);">
                      💬 Hilo de Respuestas (${commentsCount})
                    </h4>

                    <!-- Lista de Comentarios y Respuestas Anidadas -->
                    <div class="comments-list">
                      ${(post.comments || []).map(comment => `
                        <div class="comment-card" id="comment-${comment.id}">
                          <div class="comment-header">
                            <img src="${comment.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" class="comment-avatar" alt="${comment.author}" />
                            <div>
                              <div class="comment-author">${comment.author}</div>
                              <div class="comment-time">${comment.time || 'Reciente'}</div>
                            </div>
                          </div>

                          <div class="comment-body">${comment.text}</div>

                          <div class="comment-actions">
                            <button class="comment-action-btn" onclick="window.app.likeComment('${post.id}', '${comment.id}')">
                              👍 Me gusta (${comment.likes || 0})
                            </button>
                            <button class="comment-action-btn" onclick="window.app.toggleReplyBox('${comment.id}')">
                              💬 Responder
                            </button>
                          </div>

                          <!-- Respuestas anidadas (Replies de usuario a usuario) -->
                          ${comment.replies && comment.replies.length > 0 ? `
                            <div class="comment-replies-list">
                              ${comment.replies.map(reply => `
                                <div class="reply-card">
                                  <div class="comment-header">
                                    <img src="${reply.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" class="comment-avatar" style="width:26px;height:26px;" alt="${reply.author}" />
                                    <div>
                                      <div class="comment-author" style="font-size:0.82rem;">${reply.author}</div>
                                      <div class="comment-time">${reply.time || 'Reciente'}</div>
                                    </div>
                                  </div>
                                  <div class="comment-body" style="font-size:0.85rem;">
                                    <span class="mention-tag">@${reply.replyToUser || comment.author}</span> ${reply.text}
                                  </div>
                                </div>
                              `).join('')}
                            </div>
                          ` : ''}

                          <!-- Formulario inline para responder a este usuario específico -->
                          <div class="inline-reply-box" id="reply-form-${comment.id}" style="display:none;">
                            <form onsubmit="window.app.handleCreateReply(event, '${post.id}', '${comment.id}', '${comment.author}')">
                              <div style="font-size:0.8rem; font-weight:700; color:var(--accent-primary); margin-bottom:6px;">
                                ↩️ Respondiendo a @${comment.author}
                              </div>
                              <input type="text" name="replyText" class="form-control" placeholder="Escribe tu respuesta para @${comment.author}..." required style="margin-bottom:8px; font-size:0.85rem;" />
                              <div style="display:flex; justify-content:flex-end; gap:8px;">
                                <button type="button" class="btn-nav-step" style="padding:4px 10px; font-size:0.75rem;" onclick="window.app.toggleReplyBox('${comment.id}')">Cancelar</button>
                                <button type="submit" class="btn-primary-action" style="padding:4px 14px; font-size:0.75rem;">Responder (+10 XP)</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      `).join('')}
                    </div>

                    <!-- Formulario para agregar nuevo comentario principal -->
                    <form onsubmit="window.app.handleAddComment(event, '${post.id}')" style="margin-top:12px;">
                      <div style="display:flex; gap:8px;">
                        <input type="text" name="commentText" class="form-control" placeholder="Escribe un comentario en esta publicación..." required style="flex:1;" />
                        <button type="submit" class="btn-primary-action" style="padding:8px 16px; font-size:0.85rem; white-space:nowrap;">Comentar (+10 XP)</button>
                      </div>
                    </form>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Sidebar Info -->
        <aside>
          <div class="admin-panel-card" style="padding:1.25rem;">
            <h4>📌 Reglas de la Comunidad</h4>
            <ul style="margin-left:1.2rem; margin-top:8px; font-size:0.88rem; color:var(--text-muted);">
              <li>Sé respetuoso con los otros estudiantes.</li>
              <li>Responde a las dudas de otros para sumar XP.</li>
              <li>Aprende y comparte tus avances en E-commerce.</li>
            </ul>
          </div>
        </aside>
      </div>
    `;
  }

  handleCreatePost(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const content = formData.get('content');
    const category = formData.get('category');

    const newPost = {
      id: `post_${Date.now()}`,
      authorName: this.state.currentUser.name,
      authorAvatar: this.state.currentUser.avatar,
      time: 'Hace un momento',
      category,
      title,
      content,
      likes: 0,
      comments: []
    };

    this.updateState(state => {
      state.communityPosts.unshift(newPost);
    });
    this.addXP(20);
    this.showToast('Publicación creada con éxito (+20 XP)', 'success');
  }

  likePost(postId) {
    this.updateState(state => {
      const p = state.communityPosts.find(x => x.id === postId);
      if (p) p.likes++;
    });
  }

  toggleReplyBox(commentId) {
    const box = document.getElementById(`reply-form-${commentId}`);
    if (box) {
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
      if (box.style.display === 'block') {
        const input = box.querySelector('input');
        if (input) input.focus();
      }
    }
  }

  handleAddComment(e, postId) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get('commentText');

    const newComment = {
      id: `c_${Date.now()}`,
      author: this.state.currentUser.name,
      avatar: this.state.currentUser.avatar,
      text,
      time: 'Hace un momento',
      likes: 0,
      replies: []
    };

    this.updateState(state => {
      const p = state.communityPosts.find(x => x.id === postId);
      if (p) {
        if (!p.comments) p.comments = [];
        p.comments.push(newComment);
      }
    });

    this.addXP(10);
    this.showToast('Comentario publicado (+10 XP)', 'success');
  }

  handleCreateReply(e, postId, commentId, replyToUser) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get('replyText');

    const newReply = {
      id: `r_${Date.now()}`,
      author: this.state.currentUser.name,
      avatar: this.state.currentUser.avatar,
      text,
      time: 'Hace un momento',
      replyToUser
    };

    this.updateState(state => {
      const p = state.communityPosts.find(x => x.id === postId);
      if (p && p.comments) {
        const c = p.comments.find(x => x.id === commentId);
        if (c) {
          if (!c.replies) c.replies = [];
          c.replies.push(newReply);
        }
      }
    });

    this.addXP(10);
    this.showToast(`Respuesta enviada a @${replyToUser} (+10 XP)`, 'success');
  }

  likeComment(postId, commentId) {
    this.updateState(state => {
      const p = state.communityPosts.find(x => x.id === postId);
      if (p && p.comments) {
        const c = p.comments.find(x => x.id === commentId);
        if (c) c.likes = (c.likes || 0) + 1;
      }
    });
  }

  // ==========================================================================
  // LEADERBOARD VIEW
  // ==========================================================================

  renderLeaderboard() {
    const sorted = [...this.state.leaderboard].sort((a, b) => b.xp - a.xp);

    return `
      <div class="leaderboard-card">
        <div style="text-align:center; margin-bottom:2rem;">
          <div style="font-size:2.5rem;">🥇</div>
          <h2>Tabla de Posiciones de la Comunidad</h2>
          <p style="color:var(--text-muted);">Los estudiantes más activos ganando puntos XP en lecciones y evaluaciones.</p>
        </div>

        <div>
          ${sorted.map((user, idx) => `
            <div class="leaderboard-row">
              <span class="rank-number rank-${idx + 1}">${idx + 1}</span>
              <img src="${user.avatar}" class="leader-avatar" alt="${user.name}" />
              <div class="leader-info">
                <div class="leader-name">${user.name}</div>
                <span class="level-indicator">Nivel ${user.level}</span>
              </div>
              <div class="leader-xp">⚡ ${user.xp} XP</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // ADMIN PANEL (ADMINISTRAR CURSOS, MODULOS, LECCIONES Y ENLACES DE VIDEO)
  // ==========================================================================

  renderAdminPanel() {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId) || this.state.courses[0];

    return `
      <div class="admin-header">
        <h1>⚙️ Panel de Administración y Creador</h1>
        <p>Crea nuevos cursos, organiza módulos, añade lecciones y **linkea videos de YouTube/Vimeo en la caja incrustada**.</p>
      </div>

      <div class="admin-tabs">
        <button class="btn-primary-action" onclick="window.app.openCreateLessonModal()">
          <i data-lucide="plus-circle"></i> Añadir Nueva Lección con Video
        </button>
        <button class="btn-nav-step" onclick="window.app.openCreateModuleModal()">
          <i data-lucide="folder-plus"></i> Añadir Nuevo Módulo
        </button>
      </div>

      <!-- Manage Lessons Table -->
      <div class="admin-panel-card">
        <h2>Lecciones del Curso: "${course.title}"</h2>
        
        <div style="margin-top:1.5rem;">
          ${course.modules.map(mod => `
            <div style="margin-bottom:2rem; background:var(--bg-sidebar); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1rem;">
              <div class="flex-between" style="margin-bottom:1rem; padding-bottom:8px; border-bottom:1px solid var(--border-color);">
                <h3>📦 ${mod.title}</h3>
                <span style="font-size:0.85rem; color:var(--text-muted);">${mod.lessons.length} lecciones</span>
              </div>

              <div style="display:flex; flex-direction:column; gap:8px;">
                ${mod.lessons.map(l => `
                  <div class="flex-between" style="padding:10px 14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md);">
                    <div>
                      <strong>${l.title}</strong>
                      <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
                        🔗 Video Link: <code style="color:var(--accent-primary);">${l.videoUrl || 'Sin video linkeado'}</code>
                      </div>
                    </div>

                    <div style="display:flex; gap:8px;">
                      <button class="btn-nav-step" style="padding:6px 12px; font-size:0.8rem;" onclick="window.app.openEditLessonModal('${l.id}')">
                        <i data-lucide="edit-3"></i> Editar / Linkear Video
                      </button>
                      <button class="btn-danger-action" onclick="window.app.deleteLesson('${mod.id}', '${l.id}')">
                        Eliminar
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Edit/Create Modal Container -->
      <div id="admin-modal-root"></div>
    `;
  }

  // Construye el HTML del editor visual de lección (modo crear o editar)
  _buildLessonEditorHTML({ courseModules, lesson = null, modId = null }) {
    const isEdit = !!lesson;
    const checklistItems = lesson?.checklist || [''];
    const videoList = this._getLessonVideos(lesson);
    if (videoList.length === 0) videoList.push('');
    const pdfList = this._getLessonPdfs(lesson);
    if (pdfList.length === 0) pdfList.push('');

    return `
      <div style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem;" id="lesson-modal-overlay">
        <div class="admin-panel-card" style="width:100%; max-width:700px; max-height:92vh; overflow-y:auto; position:relative;">

          <!-- Header del modal -->
          <div class="flex-between" style="margin-bottom:1.5rem;">
            <h2>${isEdit ? '✏️ Editar Lección' : '➕ Nueva Lección'}</h2>
            <button type="button" onclick="document.getElementById('lesson-modal-overlay').remove()" style="background:none;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer;line-height:1;">✕</button>
          </div>

          <form id="lesson-editor-form" onsubmit="window.app.${isEdit ? `handleSaveEditLesson(event,'${modId}','${lesson.id}')` : 'handleSaveNewLesson(event)'}">

            <!-- SECCIÓN 1: Información básica -->
            <div style="background:var(--bg-sidebar); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.25rem;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:1rem; font-weight:700; font-size:0.95rem;">
                📋 <span>Información básica de la lección</span>
              </div>

              ${!isEdit ? `
              <div class="form-group">
                <label>📦 ¿En qué módulo va esta lección?</label>
                <select name="moduleId" class="form-control" required>
                  ${courseModules.map(m => `<option value="${m.id}"${m.id === modId ? ' selected' : ''}>${m.title}</option>`).join('')}
                </select>
              </div>` : ''}

              <div class="form-group">
                <label>📝 Título de la lección</label>
                <input type="text" name="title" class="form-control"
                  placeholder="Ej: LECCIÓN 5: Creación de Anuncios Ganadores en Meta Ads"
                  value="${lesson?.title || ''}" required />
                <small style="color:var(--text-muted);">Escribe un título claro y descriptivo para el estudiante.</small>
              </div>

              <div class="form-group">
                <label>💬 Resumen corto <span style="color:var(--text-muted); font-weight:400;">(1 a 2 oraciones)</span></label>
                <input type="text" name="summary" class="form-control"
                  placeholder="Ej: Aprende a crear campañas de conversión por chat en Meta Ads paso a paso."
                  value="${lesson?.summary || ''}" required />
              </div>
            </div>

            <!-- SECCIÓN 2: Videos (Soporta múltiples videos) -->
            <div style="background:var(--bg-sidebar); border:1px solid var(--border-highlight); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.25rem;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:0.75rem; font-weight:700; font-size:0.95rem;">
                🎥 <span>Enlaces de Video (puedes agregar 1 o más)</span>
              </div>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">Pega los enlaces de YouTube o Vimeo. Las cajas de video vacías permanecerán <strong>totalmente ocultas</strong> para el estudiante.</p>

              <div class="dynamic-list-editor" id="video-list-editor">
                ${videoList.map((vUrl, idx) => `
                  <div class="dynamic-list-row" id="video-row-${idx}">
                    <span style="color:var(--accent-primary); font-weight:700; font-size:0.85rem; width:22px;">#${idx + 1}</span>
                    <input type="text" class="form-control video-url-input" value="${vUrl}" placeholder="Ej: https://www.youtube.com/watch?v=..." style="flex:1;" />
                    <button type="button" onclick="window.app._removeVideoRow(${idx})" style="background:none;border:none;color:var(--danger);font-size:1.2rem;cursor:pointer;padding:0 6px;" title="Eliminar video">✕</button>
                  </div>
                `).join('')}
              </div>

              <button type="button" class="btn-add-item" onclick="window.app._addVideoRow()">
                + Agregar otro video a esta lección
              </button>
            </div>

            <!-- SECCIÓN 3: PDFs (Google Drive) -->
            <div style="background:var(--bg-sidebar); border:1px solid rgba(16,185,129,0.35); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.25rem;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:0.75rem; font-weight:700; font-size:0.95rem;">
                📄 <span>Recursos PDF (Google Drive)</span>
              </div>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">Pega el link de Google Drive del PDF. El estudiante lo verá incrustado con botón de descarga incluido. Si el campo queda vacío permanecerá <strong>oculto</strong>.</p>
              <div style="background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:var(--radius-md); padding:10px 14px; margin-bottom:12px; font-size:0.82rem; color:var(--text-muted);">
                📋 <strong>Pasos para obtener el link:</strong><br>
                1. Sube el PDF a Google Drive → 2. Clic derecho → <em>Compartir</em> → <em>Cualquier persona con el enlace</em> → 3. Copia el link → 4. Pégalo aquí.<br>
                <span style="color:var(--success);">✅ Formatos aceptados: <code>drive.google.com/file/d/.../view</code> o <code>drive.google.com/open?id=...</code></span>
              </div>

              <div class="dynamic-list-editor" id="pdf-list-editor">
                ${pdfList.map((pUrl, idx) => `
                  <div class="dynamic-list-row" id="pdf-row-${idx}">
                    <span style="color:var(--success); font-weight:700; font-size:0.85rem; width:22px;">📄</span>
                    <input type="text" class="form-control pdf-url-input" value="${pUrl}" placeholder="https://drive.google.com/file/d/ABC123/view" style="flex:1;" />
                    <button type="button" onclick="window.app._removePdfRow(${idx})" style="background:none;border:none;color:var(--danger);font-size:1.2rem;cursor:pointer;padding:0 6px;" title="Eliminar PDF">✕</button>
                  </div>
                `).join('')}
              </div>

              <button type="button" class="btn-add-item" onclick="window.app._addPdfRow()" style="border-color:rgba(16,185,129,0.4); color:var(--success);">
                + Agregar otro PDF a esta lección
              </button>
            </div>

            <!-- SECCIÓN 4: Contenido de la lección -->
            <div style="background:var(--bg-sidebar); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.25rem;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:0.75rem; font-weight:700; font-size:0.95rem;">
                📖 <span>Contenido explicativo de la lección</span>
              </div>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">Escribe el texto que verán los estudiantes al abrir la lección. Usa los botones de formato para darle estructura.</p>

              <!-- Toolbar de formato visual -->
              <div class="wysiwyg-toolbar">
                <button type="button" class="editor-btn" onclick="window.app._editorFormat('bold')" title="Negrita">
                  <strong>N</strong>
                </button>
                <button type="button" class="editor-btn" onclick="window.app._editorFormat('italic')" title="Cursiva">
                  <em>I</em>
                </button>
                <button type="button" class="editor-btn" onclick="window.app._editorInsert('\n## ')" title="Título grande">
                  T↑
                </button>
                <button type="button" class="editor-btn" onclick="window.app._editorInsert('\n### ')" title="Subtítulo">
                  T↓
                </button>
                <button type="button" class="editor-btn" onclick="window.app._editorInsert('\n• ')" title="Punto de lista">
                  • Lista
                </button>
                <button type="button" class="editor-btn" onclick="window.app._editorInsert('\n> ')" title="Cita o dato clave">
                  💬 Cita
                </button>
                <button type="button" class="editor-btn" onclick="window.app._editorInsert('\n---\n')" title="Separador">
                  ─ Separar
                </button>
                <button type="button" class="editor-btn" onclick="window.app._editorInsert('\n💡 ')" title="Nota importante">
                  💡 Nota
                </button>
                <button type="button" class="editor-btn" onclick="window.app._editorInsert('\n⚠️ ')" title="Advertencia">
                  ⚠️ Cuidado
                </button>
              </div>

              <textarea
                id="lesson-content-editor"
                name="contentText"
                class="form-control wysiwyg-textarea"
                placeholder="Escribe aquí el contenido...\n\nEjemplo:\n## ¿Qué aprenderás hoy?\nEn esta lección vas a aprender a configurar tu primera campaña.\n\n• Paso 1: Entra a Meta Ads Manager\n• Paso 2: Crea un nuevo conjunto de anuncios\n\n> 💡 Consejo: Usa el objetivo de Mensajes para WhatsApp."
              >${this._contentHtmlToPlain(lesson?.contentHTML || '')}</textarea>
            </div>

            <!-- SECCIÓN 4: Checklist de tareas -->
            <div style="background:var(--bg-sidebar); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.5rem;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:0.75rem; font-weight:700; font-size:0.95rem;">
                ✅ <span>Checklist de tareas prácticas</span>
              </div>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">Agrega las acciones que el estudiante debe completar al terminar esta lección. Cada ítem es una tarea con checkbox.</p>

              <div class="dynamic-list-editor" id="checklist-editor">
                ${checklistItems.map((item, idx) => `
                  <div class="dynamic-list-row" id="chk-row-${idx}">
                    <span style="color:var(--success); font-size:1rem;">✓</span>
                    <input type="text" class="form-control checklist-input" value="${item}" placeholder="Ej: Crear mi cuenta de WhatsApp Business" style="flex:1;" />
                    <button type="button" onclick="window.app._removeChecklistRow(${idx})" style="background:none;border:none;color:var(--danger);font-size:1.2rem;cursor:pointer;padding:0 6px;" title="Eliminar">✕</button>
                  </div>
                `).join('')}
              </div>

              <button type="button" class="btn-add-item" onclick="window.app._addChecklistRow()">
                + Agregar tarea al checklist
              </button>
            </div>

            <!-- Botones de acción -->
            <div class="flex-between">
              <button type="button" class="btn-nav-step" onclick="document.getElementById('lesson-modal-overlay').remove()">Cancelar</button>
              <button type="submit" class="btn-primary-action" style="padding:14px 32px; font-size:1rem;">
                ${isEdit ? '💾 Guardar Cambios' : '✅ Crear Lección'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // Convierte HTML almacenado a texto plano para mostrar en el editor de texto
  _contentHtmlToPlain(html) {
    if (!html) return '';
    return html
      .replace(/<div class="lesson-rich-content">/g, '')
      .replace(/<\/div>/g, '')
      .replace(/<h2>/g, '\n## ').replace(/<\/h2>/g, '')
      .replace(/<h3>/g, '\n### ').replace(/<\/h3>/g, '')
      .replace(/<h4>/g, '\n#### ').replace(/<\/h4>/g, '')
      .replace(/<strong>/g, '**').replace(/<\/strong>/g, '**')
      .replace(/<em>/g, '_').replace(/<\/em>/g, '_')
      .replace(/<blockquote[^>]*>/g, '\n> ').replace(/<\/blockquote>/g, '')
      .replace(/<li>/g, '\n• ').replace(/<\/li>/g, '')
      .replace(/<ul>/g, '').replace(/<\/ul>/g, '\n')
      .replace(/<ol>/g, '').replace(/<\/ol>/g, '\n')
      .replace(/<p>/g, '\n').replace(/<\/p>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<hr\s*\/?>/g, '\n---\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Convierte el texto plano con markdown simple a HTML para guardar
  _plainTextToContentHtml(text) {
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // Headings
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      // Bold & italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Blockquote
      .replace(/^&gt; (.+)$/gm, '<div class="callout callout-primary"><p>$1</p></div>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border-color);margin:1rem 0;">')
      // Bullet list items
      .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/((<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      // Paragraphs: lines that are not block elements
      .replace(/^(?!<[hH\d]|<div|<ul|<li|<blockquote|<hr)(.+)$/gm, '<p>$1</p>')
      // Clean blank lines
      .replace(/\n{2,}/g, '\n');

    return `<div class="lesson-rich-content">${html}</div>`;
  }

  // Toolbar: insertar texto formateado en el cursor del textarea
  _editorFormat(type) {
    const ta = document.getElementById('lesson-content-editor');
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end) || 'texto';
    const wrappers = { bold: ['**', '**'], italic: ['_', '_'] };
    const [pre, post] = wrappers[type] || ['', ''];
    ta.setRangeText(`${pre}${selected}${post}`, start, end, 'select');
    ta.focus();
  }

  _editorInsert(prefix) {
    const ta = document.getElementById('lesson-content-editor');
    if (!ta) return;
    const pos = ta.selectionStart;
    ta.setRangeText(prefix, pos, pos, 'end');
    ta.focus();
  }

  // Checklist dinámico: agregar/eliminar filas
  _addChecklistRow() {
    const container = document.getElementById('checklist-editor');
    if (!container) return;
    const idx = container.children.length;
    const row = document.createElement('div');
    row.className = 'dynamic-list-row';
    row.id = `chk-row-${idx}`;
    row.innerHTML = `
      <span style="color:var(--success); font-size:1rem;">✓</span>
      <input type="text" class="form-control checklist-input" placeholder="Escribe la tarea aquí..." style="flex:1;" />
      <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--danger);font-size:1.2rem;cursor:pointer;padding:0 6px;" title="Eliminar">✕</button>
    `;
    container.appendChild(row);
  }

  _removeChecklistRow(idx) {
    const row = document.getElementById(`chk-row-${idx}`);
    if (row) row.remove();
  }

  // Mostrar preview inline de la URL del video
  _previewVideoUrl(url) {
    const { parseVideoUrl } = window._videoUtils || {};
    const previewBox = document.getElementById('video-inline-preview');
    if (!previewBox || !url.trim()) { if (previewBox) previewBox.innerHTML = ''; return; }
    const parsed = (window._parseVideoUrl || (() => null))(url);
    if (parsed && parsed.embedUrl) {
      previewBox.innerHTML = `
        <div style="position:relative; padding-bottom:30%; background:#000; border-radius:8px; overflow:hidden; border:1px solid var(--border-highlight);">
          <iframe src="${parsed.embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen loading="lazy"></iframe>
        </div>
        <p style="font-size:0.8rem; color:var(--success); margin-top:4px;">✅ Video detectado y listo para incrustar</p>
      `;
    } else {
      previewBox.innerHTML = '<p style="font-size:0.8rem;color:var(--warning);">⚠️ Pega un enlace válido de YouTube o Vimeo</p>';
    }
  }

  _getLessonVideos(lesson) {
    if (!lesson) return [];
    if (Array.isArray(lesson.videoUrls) && lesson.videoUrls.length > 0) {
      return lesson.videoUrls.map(v => (typeof v === 'string' ? v.trim() : '')).filter(v => v.length > 0);
    }
    if (lesson.videoUrl && typeof lesson.videoUrl === 'string' && lesson.videoUrl.trim().length > 0) {
      return [lesson.videoUrl.trim()];
    }
    return [];
  }

  _getLessonPdfs(lesson) {
    if (!lesson) return [];
    if (Array.isArray(lesson.pdfUrls) && lesson.pdfUrls.length > 0) {
      return lesson.pdfUrls.map(v => (typeof v === 'string' ? v.trim() : '')).filter(v => v.length > 0);
    }
    if (lesson.pdfUrl && typeof lesson.pdfUrl === 'string' && lesson.pdfUrl.trim().length > 0) {
      return [lesson.pdfUrl.trim()];
    }
    return [];
  }

  _parsePdfUrl(input) {
    if (!input || typeof input !== 'string') return null;
    const url = input.trim();
    const driveFileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const driveOpenRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
    
    let fileId = null;
    const fileMatch = url.match(driveFileRegex);
    if (fileMatch) {
      fileId = fileMatch[1];
    } else {
      const openMatch = url.match(driveOpenRegex);
      if (openMatch) fileId = openMatch[1];
    }

    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    if (url.endsWith('.pdf') || url.includes('.pdf?')) {
      return url;
    }

    return null;
  }

  _addPdfRow() {
    const container = document.getElementById('pdf-list-editor');
    if (!container) return;
    const idx = container.children.length;
    const row = document.createElement('div');
    row.className = 'dynamic-list-row';
    row.id = `pdf-row-${idx}`;
    row.innerHTML = `
      <span style="color:var(--success); font-weight:700; font-size:0.85rem; width:22px;">📄</span>
      <input type="text" class="form-control pdf-url-input" placeholder="https://drive.google.com/file/d/ABC123/view" style="flex:1;" />
      <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--danger);font-size:1.2rem;cursor:pointer;padding:0 6px;" title="Eliminar PDF">✕</button>
    `;
    container.appendChild(row);
  }

  _removePdfRow(idx) {
    const row = document.getElementById(`pdf-row-${idx}`);
    if (row) row.remove();
  }

  _getPdfUrlsFromForm() {
    const inputs = document.querySelectorAll('#pdf-list-editor .pdf-url-input');
    return Array.from(inputs).map(i => i.value.trim()).filter(v => v.length > 0);
  }

  // Multi-video editor helpers
  _addVideoRow() {
    const container = document.getElementById('video-list-editor');
    if (!container) return;
    const idx = container.children.length;
    const row = document.createElement('div');
    row.className = 'dynamic-list-row';
    row.id = `video-row-${idx}`;
    row.innerHTML = `
      <span style="color:var(--accent-primary); font-weight:700; font-size:0.85rem; width:22px;">#${idx + 1}</span>
      <input type="text" class="form-control video-url-input" placeholder="Ej: https://www.youtube.com/watch?v=..." style="flex:1;" />
      <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--danger);font-size:1.2rem;cursor:pointer;padding:0 6px;" title="Eliminar video">✕</button>
    `;
    container.appendChild(row);
  }

  _removeVideoRow(idx) {
    const row = document.getElementById(`video-row-${idx}`);
    if (row) row.remove();
  }

  _getVideoUrlsFromForm() {
    const inputs = document.querySelectorAll('#video-list-editor .video-url-input');
    return Array.from(inputs).map(i => i.value.trim()).filter(v => v.length > 0);
  }

  // Extraer checklist desde el formulario del editor
  _getChecklistFromForm() {
    const inputs = document.querySelectorAll('#checklist-editor .checklist-input');
    return Array.from(inputs).map(i => i.value.trim()).filter(v => v.length > 0);
  }

  openCreateLessonModal() {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId);
    const root = document.getElementById('admin-modal-root') || document.body;

    const existing = document.getElementById('lesson-modal-overlay');
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this._buildLessonEditorHTML({ courseModules: course.modules });
    root.appendChild(wrapper.firstElementChild);
    if (window.lucide) window.lucide.createIcons();
  }

  openEditLessonModal(lessonId) {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId);
    let targetMod = null;
    let targetLesson = null;

    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        if (l.id === lessonId) { targetMod = m; targetLesson = l; }
      });
    });

    if (!targetLesson) return;

    // Limpiar y construir el modal
    const existing = document.getElementById('lesson-modal-overlay');
    if (existing) existing.remove();

    const root = document.getElementById('admin-modal-root') || document.body;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this._buildLessonEditorHTML({
      courseModules: course.modules,
      lesson: targetLesson,
      modId: targetMod.id
    });
    root.appendChild(wrapper.firstElementChild);
    if (window.lucide) window.lucide.createIcons();
  }

  handleSaveNewLesson(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const moduleId = formData.get('moduleId');
    const title = formData.get('title');
    const videoUrls = this._getVideoUrlsFromForm();
    const pdfUrls = this._getPdfUrlsFromForm();
    const summary = formData.get('summary');
    const contentText = formData.get('contentText');
    const checklist = this._getChecklistFromForm();

    const newLesson = {
      id: `l_${Date.now()}`,
      title,
      type: 'video_content',
      videoUrl: videoUrls[0] || '',
      videoUrls: videoUrls,
      pdfUrl: pdfUrls[0] || '',
      pdfUrls: pdfUrls,
      summary,
      contentHTML: this._plainTextToContentHtml(contentText),
      checklist: checklist.length > 0 ? checklist : ['Revisar el video de la lección.']
    };

    this.updateState(state => {
      const course = state.courses.find(c => c.id === this.selectedCourseId);
      const mod = course.modules.find(m => m.id === moduleId);
      if (mod) mod.lessons.push(newLesson);
    });

    const overlay = document.getElementById('lesson-modal-overlay');
    if (overlay) overlay.remove();
    this.showToast('✅ Lección creada exitosamente', 'success');
  }

  handleSaveEditLesson(e, moduleId, lessonId) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const videoUrls = this._getVideoUrlsFromForm();
    const pdfUrls = this._getPdfUrlsFromForm();
    const summary = formData.get('summary');
    const contentText = formData.get('contentText');
    const checklist = this._getChecklistFromForm();

    this.updateState(state => {
      const course = state.courses.find(c => c.id === this.selectedCourseId);
      const mod = course.modules.find(m => m.id === moduleId);
      if (mod) {
        const l = mod.lessons.find(x => x.id === lessonId);
        if (l) {
          l.title = title;
          l.videoUrl = videoUrls[0] || '';
          l.videoUrls = videoUrls;
          l.pdfUrl = pdfUrls[0] || '';
          l.pdfUrls = pdfUrls;
          l.summary = summary;
          l.contentHTML = this._plainTextToContentHtml(contentText);
          l.checklist = checklist.length > 0 ? checklist : l.checklist;
        }
      }
    });

    const overlay = document.getElementById('lesson-modal-overlay');
    if (overlay) overlay.remove();
    this.showToast('💾 Cambios guardados correctamente', 'success');
  }

  deleteLesson(moduleId, lessonId) {
    if (!confirm('¿Seguro que deseas eliminar esta lección?')) return;

    this.updateState(state => {
      const course = state.courses.find(c => c.id === this.selectedCourseId);
      const mod = course.modules.find(m => m.id === moduleId);
      if (mod) {
        mod.lessons = mod.lessons.filter(l => l.id !== lessonId);
      }
    });

    this.showToast('Lección eliminada', 'info');
  }

  openCreateModuleModal() {
    const title = prompt('Ingresa el título del nuevo Módulo:');
    if (!title) return;

    const newMod = {
      id: `mod_${Date.now()}`,
      title,
      description: 'Nuevo módulo añadido.',
      lessons: []
    };

    this.updateState(state => {
      const course = state.courses.find(c => c.id === this.selectedCourseId);
      if (course) course.modules.push(newMod);
    });

    this.showToast('Nuevo Módulo creado', 'success');
  }

  // --- Switch Controls ---
  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  }

  toggleUserRole() {
    this.updateState(state => {
      state.currentUser.role = state.currentUser.role === 'admin' ? 'student' : 'admin';
    });
    this.showToast(`Rol cambiado a: ${this.state.currentUser.role === 'admin' ? 'Administrador' : 'Estudiante'}`, 'info');
  }

  toggleTheme() {
    document.body.classList.toggle('light-theme');
  }

  toggleModuleDrawer(modId) {
    const drawer = document.getElementById(`drawer-${modId}`);
    if (drawer) {
      drawer.style.display = drawer.style.display === 'none' ? 'flex' : 'none';
    }
  }

  // --- Motor de Búsqueda por Palabras Clave (Sin IA) ---
  handleSearchInput(val) {
    this.searchQuery = val;
    this.searchActive = val.trim().length > 0;
    const drop = document.getElementById('search-results-dropdown');
    if (drop) {
      drop.style.display = this.searchActive ? 'block' : 'none';
      drop.innerHTML = this.renderSearchResultsHTML();
      if (window.lucide) window.lucide.createIcons();
    }
  }

  handleSearchFocus() {
    if (this.searchQuery.trim().length > 0) {
      this.searchActive = true;
      const drop = document.getElementById('search-results-dropdown');
      if (drop) drop.style.display = 'block';
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchActive = false;
    const input = document.getElementById('global-search-input');
    if (input) input.value = '';
    const drop = document.getElementById('search-results-dropdown');
    if (drop) {
      drop.style.display = 'none';
      drop.innerHTML = '';
    }
  }

  _escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _performSearch(query) {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const results = [];

    this.state.courses.forEach(course => {
      course.modules.forEach(mod => {
        mod.lessons.forEach(lesson => {
          const titleText = lesson.title || '';
          const summaryText = lesson.summary || '';
          const plainContent = this._contentHtmlToPlain(lesson.contentHTML || '');
          const checklistText = (lesson.checklist || []).join(' ');
          const modTitle = mod.title || '';

          const fullText = `${modTitle} ${titleText} ${summaryText} ${plainContent} ${checklistText}`.toLowerCase();

          if (fullText.includes(q)) {
            let snippet = '';
            let matchIndex = plainContent.toLowerCase().indexOf(q);

            if (matchIndex > -1) {
              const start = Math.max(0, matchIndex - 35);
              const end = Math.min(plainContent.length, matchIndex + q.length + 45);
              let rawSnippet = plainContent.substring(start, end);
              if (start > 0) rawSnippet = '...' + rawSnippet;
              if (end < plainContent.length) rawSnippet = rawSnippet + '...';

              const regex = new RegExp(`(${this._escapeRegExp(q)})`, 'gi');
              snippet = rawSnippet.replace(regex, '<mark>$1</mark>');
            } else if (summaryText.toLowerCase().includes(q)) {
              const regex = new RegExp(`(${this._escapeRegExp(q)})`, 'gi');
              snippet = summaryText.replace(regex, '<mark>$1</mark>');
            } else {
              snippet = summaryText || 'Coincidencia en el tema de la lección.';
            }

            results.push({
              courseId: course.id,
              moduleId: mod.id,
              moduleTitle: mod.title,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              type: lesson.type,
              snippet
            });
          }
        });
      });
    });

    return results;
  }

  renderSearchResultsHTML() {
    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      return `
        <div style="text-align:center; padding:1rem; font-size:0.85rem; color:var(--text-muted);">
          🔎 Escribe al menos 2 letras para buscar...<br>
          <small style="margin-top:4px; display:block;">Ejemplos: <strong>WhatsApp</strong>, <strong>B2C</strong>, <strong>SSL</strong>, <strong>Business Manager</strong>, <strong>Moneda</strong></small>
        </div>
      `;
    }

    const results = this._performSearch(this.searchQuery);

    if (results.length === 0) {
      return `
        <div style="text-align:center; padding:1.25rem;">
          <div style="font-size:1.5rem; margin-bottom:4px;">❌</div>
          <strong style="font-size:0.95rem;">Información no encontrada</strong>
          <p style="color:var(--text-muted); font-size:0.82rem; margin-top:6px; line-height:1.4;">
            No se encontró información sobre "<b>${this.searchQuery}</b>" en las lecciones de este curso.<br>
            <span style="color:var(--accent-primary); display:block; margin-top:6px;">💡 Sugerencia: Prueba buscando términos como WhatsApp, Business, SSL, B2C, Tarjeta o Fanpage.</span>
          </p>
        </div>
      `;
    }

    const completedSet = new Set(this.state.currentUser.completedLessons || []);

    return `
      <div style="font-size:0.78rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>🔍 ${results.length} resultado(s) encontrado(s)</span>
        <button type="button" onclick="window.app.clearSearch()" style="background:none;border:none;color:var(--danger);font-size:0.75rem;cursor:pointer;">Cerrar</button>
      </div>

      ${results.map(r => {
        const isDone = completedSet.has(r.lessonId);
        return `
          <div class="search-result-item" onclick="window.app.selectLessonFromSearch('${r.courseId}', '${r.moduleId}', '${r.lessonId}')">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="result-module">${r.moduleTitle}</span>
              <span style="font-size:0.7rem; font-weight:700; padding:1px 6px; border-radius:4px; ${r.type === 'quiz' ? 'background:rgba(245,158,11,0.2);color:var(--warning);' : 'background:rgba(99,102,241,0.2);color:var(--accent-primary);'}">
                ${r.type === 'quiz' ? 'QUIZ' : 'LECCIÓN'} ${isDone ? '✓' : ''}
              </span>
            </div>
            <div class="result-title">${r.lessonTitle}</div>
            <div class="result-snippet">${r.snippet}</div>
          </div>
        `;
      }).join('')}
    `;
  }

  selectLessonFromSearch(courseId, modId, lessonId) {
    this.selectedCourseId = courseId;
    this.selectedModuleId = modId;
    this.selectedLessonId = lessonId;
    this.clearSearch();
    this.switchTab('classroom');
    this.showToast('📍 Navegado a la lección encontrada', 'success');
  }

  attachGlobalListeners() {
    // Expose app instance to window for inline onclick handlers
    window.app = this;

    // Cerrar menú de búsqueda al hacer clic fuera
    document.addEventListener('click', (e) => {
      const searchContainer = document.querySelector('.header-search-container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        this.searchActive = false;
        const drop = document.getElementById('search-results-dropdown');
        if (drop) drop.style.display = 'none';
      }
    });
  }
}

// Instantiate App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SkoolApp();
});
