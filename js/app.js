import { loadState, saveState, resetToInitial } from './services/storage.js';
import { renderVideoContainer } from './utils/video.js';
import { getSupabase, isSupabaseReady } from './services/supabaseClient.js';

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

    // Supabase Auth State
    this.authModalOpen = false;
    this.authActiveTab = 'login';
    this.authenticatedUser = null;
    this.authError = null;
    this.authLoading = false;

    // Course Creator State
    this.createCourseModalOpen = false;

    // Focus / Theater Mode State
    this.isFocusMode = false;

    this.init();
  }

  init() {
    this.initSupabaseAuth();
    this.render();
    this.attachGlobalListeners();
  }

  async fetchUserProfile(user) {
    if (!user) return null;
    const supabase = getSupabase();
    let role = 'student';
    let fullName = user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'Estudiante');

    if (supabase) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (profile.role) role = profile.role;
          if (profile.full_name) fullName = profile.full_name;
        }
      } catch (err) {
        console.warn('Error al obtener perfil desde Supabase:', err);
      }
    }

    return {
      id: user.id,
      email: user.email,
      fullName: fullName,
      role: role
    };
  }

  async initSupabaseAuth() {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      // Cargar cursos públicos de Supabase siempre (visitante o autenticado)
      await this.loadCoursesFromSupabase();

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this.authenticatedUser = await this.fetchUserProfile(session.user);
        await this.loadStudentProgressFromSupabase();
        await this.loadCoursesFromSupabase();
        this.render();
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          this.authenticatedUser = await this.fetchUserProfile(session.user);
          await this.loadStudentProgressFromSupabase();
          await this.loadCoursesFromSupabase();
        } else {
          this.authenticatedUser = null;
          await this.loadCoursesFromSupabase();
        }
        this.render();
      });
    } catch (e) {
      console.warn('Supabase Auth init:', e);
    }
  }

  // --- State Persistence & Helpers ---
  sanitizeHTML(html) {
    if (!html) return '';
    if (window.DOMPurify) {
      return window.DOMPurify.sanitize(html, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'style', 'class']
      });
    }
    return html;
  }

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

  triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  // --- XP & Gamification ---
  addXP(amount) {
    this.state.currentUser.xp += amount;
    // Level calculation (Every 200 XP = 1 Level)
    const newLevel = Math.floor(this.state.currentUser.xp / 200) + 1;
    if (newLevel > this.state.currentUser.level) {
      this.state.currentUser.level = newLevel;
      this.triggerConfetti();
      this.showToast(`🎉 ¡Felicidades! Subiste al Nivel ${newLevel}`, 'success');
    } else {
      this.showToast(`+${amount} Puntos XP ganados!`, 'success');
    }
    saveState(this.state);
  }

  // --- Main Render Engine ---
  render() {
    // Capturar la posición de scroll previa del sidebar si existe
    const prevSidebar = document.querySelector('.modules-sidebar');
    const prevScrollTop = prevSidebar ? prevSidebar.scrollTop : null;

    const appEl = document.getElementById('app');
    appEl.innerHTML = `
      ${this.renderHeader()}
      <main class="main-content">
        ${this.renderActiveTab()}
      </main>
      ${this.renderAuthModal()}
      ${this.renderCreateCourseModal()}
    `;

    // Re-initialize Lucide Icons for dynamic content
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Auto-scroll del sidebar hacia la lección activa posicionándola en el MEDIO de la pantalla
    const newSidebar = document.querySelector('.modules-sidebar');
    if (newSidebar) {
      const activeLessonEl = newSidebar.querySelector('.sidebar-lesson-item.active');
      if (activeLessonEl) {
        activeLessonEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      } else if (prevScrollTop !== null) {
        newSidebar.scrollTop = prevScrollTop;
      }
    }
  }

  // --- Course Creator Modal & Handlers ---
  openCreateCourseModal() {
    if (!this.authenticatedUser) {
      this.openAuthModal('signup');
      this.showToast('🚀 Inicia sesión o crea una cuenta para crear tu propio curso', 'info');
      return;
    }
    this.createCourseModalOpen = true;
    this.render();
  }

  closeCreateCourseModal() {
    this.createCourseModalOpen = false;
    this.render();
  }

  async handleCreateCourseSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Límite de seguridad: máximo 5 cursos por usuario normal (Super Admin ilimitado)
    if (!this.isUserSuperAdmin() && this.authenticatedUser) {
      const ownedCount = this.state.courses.filter(c => c.creator_id === this.authenticatedUser.id).length;
      if (ownedCount >= 5) {
        this.showToast('⚠️ Has alcanzado el límite máximo de 5 cursos creados por cuenta.', 'warning');
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
    }

    const title = this.sanitizeHTML(form.title.value.trim());
    const subtitle = this.sanitizeHTML(form.subtitle.value.trim());
    const badge = this.sanitizeHTML(form.badge.value.trim() || 'E-learning');
    const coverUrl = form.coverUrl.value.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';

    if (!title || !subtitle) {
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const newCourseId = 'course_' + Date.now();
    const creatorId = this.authenticatedUser ? this.authenticatedUser.id : 'demo_user';
    const creatorName = this.authenticatedUser ? this.authenticatedUser.fullName : 'Creador';

    const newCourse = {
      id: newCourseId,
      title: title,
      subtitle: subtitle,
      badge: badge,
      coverUrl: coverUrl,
      creator_id: creatorId,
      creator_name: creatorName,
      modules: [
        {
          id: 'mod_1_' + Date.now(),
          title: 'MÓDULO 1: Introducción al Curso',
          lessons: [
            {
              id: 'les_1_' + Date.now(),
              title: 'Lección 1: Bienvenida e Instrucciones',
              duration: '5 min',
              type: 'video_content',
              videoUrl: '',
              pdfUrl: '',
              contentHTML: '<h3>¡Bienvenido/a a ' + title + '!</h3><p>Este es tu propio curso. Ve al menú superior <strong>Administración</strong> para agregar más lecciones, videos de YouTube, PDFs o exámenes evaluativos.</p>',
              checklist: ['Completar tu perfil de estudiante', 'Revisar el material del curso']
            }
          ]
        }
      ]
    };

    this.updateState(state => {
      state.courses.push(newCourse);
    });

    // Intentar guardar en Supabase si está conectado
    const supabase = getSupabase();
    if (supabase && this.authenticatedUser) {
      try {
        await supabase.from('courses').upsert({
          id: newCourseId,
          title: title,
          description: subtitle,
          creator_id: creatorId,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Persist course to Supabase:', err);
      }
    }

    this.closeCreateCourseModal();
    this.selectCourse(newCourseId);
    this.showToast(`🎉 ¡Curso "${title}" creado con éxito! Eres el Creador/Administrador de este curso.`, 'success');
  }

  renderCreateCourseModal() {
    if (!this.createCourseModalOpen) return '';

    return `
      <div class="modal-overlay" onclick="if(event.target === this) window.app.closeCreateCourseModal()" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.65); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:9999;">
        <div class="modal-card animate-fade-in" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; max-width:480px; width:90%; box-shadow:var(--shadow-xl);">
          <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1rem;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.4rem;">🎓</span>
              <h3 style="margin:0; font-size:1.1rem; color:var(--text-main); font-weight:700;">Crear Mi Propio Curso</h3>
            </div>
            <button class="btn-close" onclick="window.app.closeCreateCourseModal()" style="background:none; border:none; color:var(--text-muted); font-size:1.2rem; cursor:pointer;">✕</button>
          </div>

          <form onsubmit="window.app.handleCreateCourseSubmit(event)" style="margin-top:1.2rem;">
            <div class="form-group" style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:var(--text-main);">Título del Curso</label>
              <input type="text" name="title" class="form-control" placeholder="Ej: Máster en Meta Ads & Ecommerce 2026" required style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-sidebar); color:var(--text-main);" />
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:var(--text-main);">Subtítulo / Descripción Corta</label>
              <input type="text" name="subtitle" class="form-control" placeholder="Ej: Aprende a crear campañas publicitarias de alto retorno" required style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-sidebar); color:var(--text-main);" />
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:var(--text-main);">Categoría / Etiqueta</label>
              <input type="text" name="badge" class="form-control" placeholder="Ej: Marketing Digital, Ventas, Negocios" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-sidebar); color:var(--text-main);" />
            </div>

            <div class="form-group" style="margin-bottom:1.5rem;">
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:var(--text-main);">URL de Imagen de Portada (Opcional)</label>
              <input type="url" name="coverUrl" class="form-control" placeholder="https://images.unsplash.com/..." style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-sidebar); color:var(--text-main);" />
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; font-weight:700; display:flex; justify-content:center; align-items:center; gap:8px;">
              🚀 Crear e Iniciar Administrador del Curso
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // --- Auth Modal & Handlers ---
  openAuthModal(tab = 'login') {
    this.authModalOpen = true;
    this.authActiveTab = tab;
    this.authError = null;
    this.authMessage = null;
    this.render();
  }

  closeAuthModal() {
    this.authModalOpen = false;
    this.authError = null;
    this.authMessage = null;
    this.render();
  }

  switchAuthTab(tab) {
    this.authActiveTab = tab;
    this.authError = null;
    this.authMessage = null;
    this.render();
  }

  async handleAuthSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email ? form.email.value.trim() : '';
    const password = form.password ? form.password.value : '';
    const fullName = form.fullName ? form.fullName.value.trim() : '';

    const supabase = getSupabase();

    if (!supabase) {
      // Modo Demo Local: simula inicio de sesión localmente sin romper nada
      this.authenticatedUser = {
        id: 'demo_user_' + Date.now(),
        email: email || 'demo@ehook.com',
        fullName: fullName || (email ? email.split('@')[0] : 'Demo User')
      };
      this.closeAuthModal();
      this.showToast(`✨ ¡Bienvenido/a, ${this.authenticatedUser.fullName}! (Modo Demo Local)`, 'success');
      return;
    }

    this.authLoading = true;
    this.authError = null;
    this.render();

    try {
      if (this.authActiveTab === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.authenticatedUser = await this.fetchUserProfile(data.user);
        await this.loadStudentProgressFromSupabase();
        await this.loadCoursesFromSupabase();
        this.closeAuthModal();
        this.showToast(`👋 ¡Hola de nuevo, ${this.authenticatedUser.fullName}!`, 'success');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: 'https://traficker.github.io/e-hook/'
          }
        });
        if (error) throw error;

        // Si Supabase exige confirmación por correo y no genera sesión inmediata
        if (data?.user && !data.session) {
          this.authError = null;
          this.authMessage = `📧 ¡Cuenta creada con éxito! Te hemos enviado un correo de confirmación a <strong>${email}</strong>.<br><br>Por favor abre tu correo electrónico y haz clic en el enlace de verificación para activar tu cuenta e iniciar sesión.`;
          this.authLoading = false;
          this.render();
          return;
        }

        this.authenticatedUser = await this.fetchUserProfile(data.user);
        await this.loadCoursesFromSupabase();
        this.closeAuthModal();
        this.showToast(`🎉 ¡Cuenta creada con éxito! Bienvenido/a, ${this.authenticatedUser.fullName}`, 'success');
      }
    } catch (err) {
      let msg = err.message || 'Ocurrió un error en la autenticación.';
      
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('already in use')) {
        msg = '⚠️ Este correo electrónico ya está registrado en E-hook. Por favor pasa a la pestaña "Iniciar Sesión".';
      } else if (msg.includes('Invalid login credentials')) {
        msg = '⚠️ Correo electrónico o contraseña incorrectos. Por favor verifica tus datos.';
      } else if (msg.includes('Password should be at least')) {
        msg = '⚠️ La contraseña debe tener al menos 6 caracteres.';
      }

      this.authError = msg;
      this.authLoading = false;
      this.render();
    }
  }

  async handleLogout() {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    this.authenticatedUser = null;
    this.showToast('👋 Sesión cerrada correctamente', 'info');
    this.render();
  }

  renderAuthModal() {
    if (!this.authModalOpen) return '';

    const isLogin = this.authActiveTab === 'login';

    return `
      <div class="modal-overlay" onclick="if(event.target === this) window.app.closeAuthModal()" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.65); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:9999;">
        <div class="modal-card auth-modal-card animate-fade-in" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; max-width:420px; width:90%; box-shadow:var(--shadow-xl);">
          <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1rem;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="brand-logo" style="width:32px; height:32px; font-size:0.85rem; font-weight:800; background:var(--accent-primary); color:#fff; border-radius:8px; display:inline-flex; align-items:center; justify-content:center;">EH</div>
              <h3 style="margin:0; font-size:1.1rem; color:var(--text-main); font-weight:700;">Acceso a E-hook</h3>
            </div>
            <button class="btn-close" onclick="window.app.closeAuthModal()" style="background:none; border:none; color:var(--text-muted); font-size:1.2rem; cursor:pointer; padding:4px 8px;">✕</button>
          </div>

          <div class="auth-tabs" style="display:flex; border-bottom:1px solid var(--border-color); margin-top:1rem;">
            <button type="button" class="auth-tab-btn ${isLogin ? 'active' : ''}" 
                    onclick="window.app.switchAuthTab('login')" 
                    style="flex:1; padding:10px; background:none; border:none; border-bottom:2px solid ${isLogin ? 'var(--accent-primary)' : 'transparent'}; color:${isLogin ? 'var(--accent-primary)' : 'var(--text-muted)'}; font-weight:700; cursor:pointer; font-size:0.9rem;">
              <i data-lucide="log-in" style="width:15px;height:15px;vertical-align:middle;margin-right:4px;"></i> Iniciar Sesión
            </button>
            <button type="button" class="auth-tab-btn ${!isLogin ? 'active' : ''}" 
                    onclick="window.app.switchAuthTab('signup')" 
                    style="flex:1; padding:10px; background:none; border:none; border-bottom:2px solid ${!isLogin ? 'var(--accent-primary)' : 'transparent'}; color:${!isLogin ? 'var(--accent-primary)' : 'var(--text-muted)'}; font-weight:700; cursor:pointer; font-size:0.9rem;">
              <i data-lucide="user-plus" style="width:15px;height:15px;vertical-align:middle;margin-right:4px;"></i> Crear Cuenta
            </button>
          </div>

          <form onsubmit="window.app.handleAuthSubmit(event)" style="margin-top:1.2rem;">
            ${this.authMessage ? `
              <div class="callout callout-accent" style="padding:12px; margin-bottom:1rem; background:rgba(99,102,241,0.1); border-left:3px solid var(--accent-primary); font-size:0.85rem; color:var(--text-main); border-radius:4px; line-height:1.4;">
                ${this.authMessage}
              </div>
            ` : ''}

            ${this.authError ? `
              <div class="callout callout-danger" style="padding:10px; margin-bottom:1rem; background:rgba(239,68,68,0.1); border-left:3px solid var(--danger); font-size:0.85rem; color:var(--danger); border-radius:4px;">
                ⚠️ ${this.authError}
              </div>
            ` : ''}

            ${!isLogin ? `
              <div class="form-group" style="margin-bottom:1rem;">
                <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:var(--text-main);">Nombre Completo</label>
                <input type="text" name="fullName" class="form-control" placeholder="Ej: Carlos Mendoza" required style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-sidebar); color:var(--text-main); font-size:0.9rem;" />
              </div>
            ` : ''}

            <div class="form-group" style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:var(--text-main);">Correo Electrónico</label>
              <input type="email" name="email" class="form-control" placeholder="tu-correo@ejemplo.com" required style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-sidebar); color:var(--text-main); font-size:0.9rem;" />
            </div>

            <div class="form-group" style="margin-bottom:1.5rem;">
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:var(--text-main);">Contraseña</label>
              <input type="password" name="password" class="form-control" placeholder="••••••••" required minlength="6" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-sidebar); color:var(--text-main); font-size:0.9rem;" />
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; font-weight:700; display:flex; justify-content:center; align-items:center; gap:8px; border-radius:var(--radius-md);" ${this.authLoading ? 'disabled' : ''}>
              ${this.authLoading ? '<span>Procesando...</span>' : (isLogin ? '🔑 Iniciar Sesión' : '🚀 Registrarme')}
            </button>
          </form>
        </div>
      </div>
    `;
  }

  isUserSuperAdmin() {
    if (!this.authenticatedUser) return false;
    return this.authenticatedUser.role === 'superadmin';
  }

  isUserAdmin(courseId = null) {
    // Si no ha iniciado sesión, NINGÚN usuario es admin
    if (!this.authenticatedUser) return false;

    // Si el usuario tiene rol 'superadmin' en Supabase, tiene acceso de administración total
    if (this.isUserSuperAdmin()) return true;

    const targetCourseId = courseId || this.selectedCourseId;
    const course = this.state.courses.find(c => c.id === targetCourseId);

    // Si el usuario es el creador de este curso específico
    if (course && course.creator_id) {
      return course.creator_id === this.authenticatedUser.id;
    }

    return false;
  }

  async loadCoursesFromSupabase() {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase.from('courses').select('*');
      if (!error && data && data.length > 0) {
        this.updateState(state => {
          state.courses = data.map(cloudCourse => ({
            id: cloudCourse.id,
            title: cloudCourse.title,
            subtitle: cloudCourse.subtitle || cloudCourse.description || '',
            badge: cloudCourse.badge || 'Oficial & Completo',
            coverUrl: cloudCourse.cover_url || cloudCourse.coverUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
            creator_id: cloudCourse.creator_id,
            creator_name: cloudCourse.creator_name || 'Super Admin',
            modules: cloudCourse.modules || []
          }));
        });

        // Asegurar que haya un curso seleccionado válido
        if (this.state.courses.length > 0) {
          if (!this.state.courses.some(c => c.id === this.selectedCourseId)) {
            const firstCourse = this.state.courses[0];
            this.selectedCourseId = firstCourse.id;
            if (firstCourse.modules && firstCourse.modules.length > 0) {
              this.selectedModuleId = firstCourse.modules[0].id;
              this.selectedLessonId = firstCourse.modules[0].lessons[0]?.id || null;
            }
          }
        }
      }
    } catch (e) {
      console.warn('loadCoursesFromSupabase:', e);
    }
  }

  async duplicateCourse(courseId, event = null) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    // BLOQUEO ESTRICTO DE SEGURIDAD: Solo Super Admin
    if (!this.isUserSuperAdmin()) {
      console.warn('⛔ Acceso denegado: Solo el Super Admin puede duplicar cursos.');
      this.showToast('⛔ Acceso denegado: Acción reservada exclusivamente para el Super Admin.', 'danger');
      return;
    }

    const sourceCourse = this.state.courses.find(c => c.id === courseId);
    if (!sourceCourse) {
      this.showToast('❌ Error: Curso no encontrado para duplicar.', 'danger');
      return;
    }

    const timestamp = Date.now();
    const newCourseId = `course_dup_${timestamp}`;
    const newTitle = `${sourceCourse.title} (Copia)`;

    // Clonación profunda de módulos y lecciones regenerando IDs únicos
    const duplicatedModules = (sourceCourse.modules || []).map((mod, modIdx) => {
      const newModId = `mod_dup_${timestamp}_${modIdx + 1}`;
      const duplicatedLessons = (mod.lessons || []).map((les, lesIdx) => {
        const newLesId = `les_dup_${timestamp}_${modIdx + 1}_${lesIdx + 1}`;
        return {
          ...JSON.parse(JSON.stringify(les)),
          id: newLesId
        };
      });

      return {
        ...JSON.parse(JSON.stringify(mod)),
        id: newModId,
        lessons: duplicatedLessons
      };
    });

    const newCourse = {
      ...JSON.parse(JSON.stringify(sourceCourse)),
      id: newCourseId,
      title: newTitle,
      creator_id: this.authenticatedUser.id,
      creator_name: this.authenticatedUser.fullName || 'Super Admin',
      modules: duplicatedModules,
      created_at: new Date().toISOString()
    };

    // Actualizar estado local
    this.updateState(state => {
      state.courses.push(newCourse);
    });

    // Guardar en Supabase si está disponible
    const supabase = getSupabase();
    if (supabase && this.authenticatedUser) {
      try {
        const { error } = await supabase.from('courses').upsert({
          id: newCourse.id,
          title: newCourse.title,
          subtitle: newCourse.subtitle || '',
          badge: newCourse.badge || 'Oficial & Completo',
          cover_url: newCourse.coverUrl || '',
          creator_id: this.authenticatedUser.id,
          creator_name: newCourse.creator_name,
          modules: newCourse.modules,
          updated_at: new Date().toISOString()
        });
        if (error) {
          console.warn('Nota: Curso guardado localmente. Estado tabla courses Supabase:', error.message);
        } else {
          console.log('✅ Curso duplicado y sincronizado exitosamente en Supabase.');
        }
      } catch (err) {
        console.warn('Supabase course sync error:', err);
      }
    }

    this.selectCourse(newCourseId);
    this.showToast(`🎉 ¡Curso duplicado exitosamente con ${duplicatedModules.length} módulos completos!`, 'success');
  }

  async deleteCourse(courseId, event = null) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!this.authenticatedUser) {
      this.showToast('🔒 Debes iniciar sesión para realizar esta acción.', 'warning');
      return;
    }

    const course = this.state.courses.find(c => c.id === courseId);
    if (!course) {
      this.showToast('❌ Curso no encontrado.', 'danger');
      return;
    }

    const isSuperAdmin = this.isUserSuperAdmin();
    const isOwner = course.creator_id === this.authenticatedUser.id;

    // Validación estricta de permisos: Solo Super Admin o el propio Creador
    if (!isSuperAdmin && !isOwner) {
      this.showToast('⛔ Acceso denegado: Solo el Super Admin o el creador del curso pueden eliminarlo.', 'danger');
      return;
    }

    // Confirmación modal de seguridad
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el curso:\n"${course.title}"?\n\nEsta acción borrará todas sus lecciones y módulos. No se puede deshacer.`);
    if (!confirmed) return;

    // Eliminar del estado local
    this.updateState(state => {
      state.courses = state.courses.filter(c => c.id !== courseId);
    });

    // Eliminar de Supabase (courses y progresos asociados)
    const supabase = getSupabase();
    if (supabase) {
      try {
        // 1. Borrar progresos asociados a este curso en Supabase
        await supabase.from('student_progress').delete().eq('course_id', courseId);

        // 2. Borrar el curso de la tabla courses en Supabase
        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) {
          console.warn('Nota sobre eliminación en Supabase:', error.message);
        } else {
          console.log(`✅ Curso "${course.title}" (${courseId}) eliminado exitosamente de la base de datos Supabase.`);
        }
      } catch (err) {
        console.warn('Error al eliminar curso en Supabase:', err);
      }
    }

    // Si el curso eliminado era el que estaba activo, seleccionar otro disponible
    if (this.selectedCourseId === courseId) {
      if (this.state.courses.length > 0) {
        this.selectCourse(this.state.courses[0].id);
      } else {
        this.clearLessonSelection();
      }
    }

    this.showToast(`🗑️ Curso "${course.title}" eliminado exitosamente.`, 'success');
  }

  // --- Header & Navigation Bar ---
  renderHeader() {
    const { currentUser } = this.state;
    const isAdmin = this.isUserAdmin();

    const course = this.state.courses.find(c => c.id === this.selectedCourseId) || this.state.courses[0];
    const totalLessons = course ? course.modules.reduce((acc, m) => acc + m.lessons.length, 0) : 0;
    const completedCount = currentUser.completedLessons ? currentUser.completedLessons.length : 0;
    const progressPct = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

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
          <!-- Indicador & Barra de Progreso del Curso -->
          <div class="header-progress-box" title="Tu porcentaje de avance en el curso actual" style="display:flex; flex-direction:column; justify-content:center; gap:3px; padding:4px 10px; background:var(--bg-sidebar); border:1px solid var(--border-color); border-radius:var(--radius-md); min-width:125px;">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; font-weight:700; color:var(--text-muted);">
              <span>Avance</span>
              <span style="color:var(--accent-primary); font-weight:800;">${progressPct}%</span>
            </div>
            <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
              <div style="width:${progressPct}%; height:100%; background:linear-gradient(90deg, #6366f1, #10b981); transition:width 0.4s ease; border-radius:3px;"></div>
            </div>
          </div>
          <div class="user-xp-badge">
            <span class="level-indicator">Nivel ${currentUser.level}</span>
            <span class="xp-amount">⚡ ${currentUser.xp} XP</span>
          </div>

          ${this.authenticatedUser ? `
            <div class="user-profile-menu" style="display:flex; align-items:center; gap:8px;">
              <span class="avatar-circle" style="width:28px; height:28px; background:var(--accent-primary); color:#fff; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800;">
                ${(this.authenticatedUser.fullName || 'U').charAt(0).toUpperCase()}
              </span>
              <span style="font-size:0.85rem; font-weight:700; color:var(--text-main); max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${this.authenticatedUser.fullName}
              </span>
              <button class="btn-logout" onclick="window.app.handleLogout()" title="Cerrar Sesión">
                <i data-lucide="log-out" style="width:15px; height:15px;"></i>
              </button>
            </div>
          ` : `
            <button class="btn btn-primary btn-sm btn-auth-trigger" onclick="window.app.openAuthModal('login')" style="gap:6px; font-weight:700;">
              <i data-lucide="user" style="width:15px; height:15px;"></i>
              <span>Iniciar Sesión</span>
            </button>
          `}

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

    // Si el usuario ya entró a ver las lecciones de un curso específico
    if (this.selectedLessonId) {
      return this.renderLessonViewer(course);
    }

    // Buscar la lección sugerida para reanudar
    let resumeMod = course.modules ? course.modules[0] : null;
    let resumeLes = resumeMod?.lessons ? resumeMod.lessons[0] : null;
    const completedSet = new Set(this.state.currentUser.completedLessons || []);
    if (course.modules) {
      for (const m of course.modules) {
        for (const l of m.lessons) {
          if (!completedSet.has(l.id)) {
            resumeMod = m;
            resumeLes = l;
            break;
          }
        }
        if (resumeLes && !completedSet.has(resumeLes.id)) break;
      }
    }

    // Catálogo General de Cursos
    return `
      ${resumeLes ? `
        <!-- Banner Reanudar Clase -->
        <div class="resume-learning-banner" onclick="window.app.selectLesson('${resumeMod.id}', '${resumeLes.id}')">
          <div class="resume-left">
            <div class="resume-icon">⚡</div>
            <div>
              <div class="resume-tag">CONTINUAR DONDE LO DEJASTE</div>
              <h3 class="resume-title">${resumeLes.title}</h3>
              <span class="resume-mod">${course.title} • ${resumeMod.title}</span>
            </div>
          </div>
          <button class="btn btn-primary resume-btn">
            ▶️ Reanudar Lección
          </button>
        </div>
      ` : ''}

      <div class="courses-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <h1 style="margin:0; font-size:1.8rem; color:var(--text-main);">Catálogo de Cursos</h1>
          <p style="color:var(--text-muted); margin-top:4px; font-size:0.95rem;">Explora los cursos disponibles o crea el tuyo propio para tu comunidad.</p>
        </div>
        <button class="btn btn-primary" onclick="window.app.openCreateCourseModal()" style="display:flex; align-items:center; gap:8px; font-weight:700; padding:10px 18px; border-radius:var(--radius-md);">
          <i data-lucide="plus-circle" style="width:18px; height:18px;"></i>
          <span>➕ Crear Mi Propio Curso</span>
        </button>
      </div>

      <div class="courses-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:1.5rem;">
        ${this.state.courses.map(c => {
          const totalLessons = c.modules ? c.modules.reduce((acc, m) => acc + m.lessons.length, 0) : 0;
          const isOwner = this.authenticatedUser && c.creator_id === this.authenticatedUser.id;
          const isSelected = c.id === this.selectedCourseId;
          const completedCount = this.state.currentUser.completedLessons ? this.state.currentUser.completedLessons.length : 0;
          const progressPct = Math.min(100, Math.round((completedCount / (totalLessons || 1)) * 100));

          return `
            <div class="course-card ${isSelected ? 'selected-course-card' : ''}" onclick="window.app.selectCourse('${c.id}')" style="background:var(--bg-card); border:1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}; border-radius:var(--radius-lg); overflow:hidden; transition:transform 0.2s ease, box-shadow 0.2s ease; cursor:pointer;">
              <img src="${c.coverUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}" alt="${c.title}" class="course-banner-img" style="width:100%; height:160px; object-fit:cover;" />
              <div class="course-card-body" style="padding:1.2rem;">
                <div class="course-badges" style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                  <span class="badge-tag">${c.badge || 'Curso'}</span>
                  <span class="badge-tag" style="background: rgba(16,185,129,0.15); color: var(--success); border-color: rgba(16,185,129,0.3);">
                    ${totalLessons} Lecciones
                  </span>
                  ${isOwner ? `<span class="badge-tag" style="background:rgba(99,102,241,0.2); color:var(--accent-primary);">👑 Tu Curso</span>` : ''}
                </div>
                <h3 class="course-card-title" style="font-size:1.15rem; margin:0 0 6px 0; color:var(--text-main); font-weight:700;">${c.title}</h3>
                <p class="course-card-desc" style="font-size:0.85rem; color:var(--text-muted); line-height:1.4; margin-bottom:1rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${c.subtitle}</p>

                <div class="progress-container" style="margin-bottom:1rem;">
                  <div class="progress-header" style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">
                    <span>Tu Avance</span>
                    <span style="font-weight:700; color:var(--accent-primary);">${progressPct}%</span>
                  </div>
                  <div class="progress-bar-bg" style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                    <div class="progress-bar-fill" style="width: ${progressPct}%; height:100%; background:linear-gradient(90deg, #6366f1, #10b981); transition:width 0.4s ease;"></div>
                  </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:var(--text-muted); border-top:1px solid var(--border-color); padding-top:10px; flex-wrap:wrap; gap:8px;">
                  <span>Por: <strong>${c.creator_name || 'E-hook'}</strong></span>
                  <div style="display:flex; gap:6px; align-items:center;">
                    ${(isOwner || this.isUserSuperAdmin()) ? `
                      <button class="btn btn-sm btn-delete-course" onclick="window.app.deleteCourse('${c.id}', event)" title="Eliminar este curso permanentemente">
                        🗑️ Eliminar
                      </button>
                    ` : ''}
                    ${this.isUserSuperAdmin() ? `
                      <button class="btn btn-sm btn-duplicate" onclick="window.app.duplicateCourse('${c.id}', event)" title="Duplicar este curso completo a la base de datos">
                        📋 Duplicar
                      </button>
                    ` : ''}
                    <button class="btn btn-sm btn-primary" style="font-weight:700;">
                      ${isOwner ? '⚙️ Administrar' : '▶️ Entrar al Curso'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  showLockedToast() {
    this.showToast('🔒 Lección bloqueada. Marca la lección anterior como completada o aprueba el examen para desbloquear.', 'warning');
  }

  renderLessonViewer(course) {
    const isAdmin = this.isUserAdmin(course.id);
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

    // Calcular mapa de lecciones desbloqueadas (los quizes requieren ser APROBADOS, no solo marcados)
    const unlockedMap = {};
    flatLessonsList.forEach((item, idx) => {
      if (idx === 0 || isAdmin) {
        unlockedMap[item.lesson.id] = true;
      } else {
        const prevObj = flatLessonsList[idx - 1];
        const prevId = prevObj.lesson.id;
        
        if (prevObj.lesson.type === 'quiz') {
          // Exige que el quiz anterior esté APROBADO con la nota mínima
          const isApproved = this.state.currentUser.passedQuizzes && 
                             (this.state.currentUser.passedQuizzes[prevId] >= (prevObj.lesson.minScore || 70));
          unlockedMap[item.lesson.id] = Boolean(isApproved && completedSet.has(prevId));
        } else {
          unlockedMap[item.lesson.id] = completedSet.has(prevId);
        }
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
      <div class="lesson-layout ${this.isFocusMode ? 'focus-mode' : ''}">
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
                <div class="module-accordion-body" id="drawer-${mod.id}" style="${mod.id === currentModule.id ? 'display:flex;' : 'display:none;'}">
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
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="btn-focus-mode ${this.isFocusMode ? 'active' : ''}" onclick="window.app.toggleFocusMode()" title="Expandir/Ocultar Menú (Atajo: F)">
                <i data-lucide="${this.isFocusMode ? 'minimize-2' : 'maximize-2'}" style="width:15px; height:15px;"></i>
                <span>${this.isFocusMode ? 'Mostrar Menú' : 'Modo Enfoque'}</span>
              </button>
              ${this.state.currentUser.role === 'admin' ? `
                <button class="btn-nav-step" onclick="window.app.openEditLessonModal('${currentLesson.id}')" style="border-color:var(--warning); color:var(--warning);">
                  <i data-lucide="edit-3"></i> Editar Lección / Video URL
                </button>
              ` : ''}
            </div>
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
              ${this.sanitizeHTML(currentLesson.contentHTML) || '<p>Contenido de la lección.</p>'}
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

            ${currentLesson.type === 'quiz' ? `
              <div style="font-size:0.85rem; font-weight:700; color:var(--text-muted); display:flex; align-items:center; gap:6px; padding:8px 14px; background:var(--bg-sidebar); border:1px solid var(--border-color); border-radius:var(--radius-md);">
                ${isCompleted ? '🏆 Quiz Aprobado (+100 XP)' : '📝 Debes responder y aprobar el Quiz arriba para continuar'}
              </div>
            ` : (isCompleted ? `
              <button class="btn-complete-lesson completed" disabled style="cursor:default; opacity:0.95;" title="Esta lección ya ha sido completada">
                <i data-lucide="check-circle"></i>
                Lección Completada ✓
              </button>
            ` : `
              <button class="btn-complete-lesson"
                      onclick="window.app.toggleCompleteLesson('${currentLesson.id}')"
                      title="Marcar como completado y ganar +50 XP">
                <i data-lucide="circle"></i>
                Marcar como Completado (+50 XP)
              </button>
            `)}

            <button class="btn-nav-step" ${!nextItem ? 'disabled' : ''}
                    onclick="${nextItem ? (nextUnlocked ? `window.app.selectLesson('${nextItem.module.id}', '${nextItem.lesson.id}')` : `window.app.showLockedToast()`) : ''}">
              Siguiente Lección ${!nextUnlocked && nextItem ? '🔒' : ''} <i data-lucide="arrow-right"></i>
            </button>
          </div>

          <div class="keyboard-shortcuts-hint">
            <span>⌨️ Atajos:</span>
            <span><span class="kbd-badge">←</span> Lección anterior</span>
            <span><span class="kbd-badge">→</span> Siguiente lección</span>
            <span><span class="kbd-badge">M</span> Completar</span>
            <span><span class="kbd-badge">F</span> Modo Enfoque</span>
            <span><span class="kbd-badge">Ctrl + K</span> Buscar</span>
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

    // BLOQUEO ESTRICTO ANTISPAM: Si ya está aprobado, no hacer nada ni saturar Supabase
    if (this.state.currentUser.passedQuizzes && this.state.currentUser.passedQuizzes[quizId] >= (quizLesson.minScore || 70)) {
      this.showToast('🏆 Ya has aprobado esta evaluación previamente.', 'info');
      return;
    }

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
      this.triggerConfetti();
      this.syncProgressToSupabase(quizId, true, scorePct);
      this.showToast(`🎉 ¡Aprobaste la evaluación con ${scorePct}%! (+100 XP)`, 'success');
    } else {
      this.showToast(`Obtuviste ${scorePct}%. Revisa el material e inténtalo de nuevo.`, 'warning');
    }
  }

  resetQuiz(quizId) {
    this.updateState(state => {
      delete state.currentUser.passedQuizzes[quizId];
    });
    this.syncProgressToSupabase(quizId, false, 0);
  }

  // --- Focus / Theater Mode ---
  toggleFocusMode() {
    this.isFocusMode = !this.isFocusMode;
    this.render();
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

  goToNextLesson() {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId) || this.state.courses[0];
    if (!course) return;
    const flat = [];
    course.modules.forEach(m => m.lessons.forEach(l => flat.push({ mod: m, les: l })));
    const idx = flat.findIndex(i => i.les.id === this.selectedLessonId);
    if (idx > -1 && idx < flat.length - 1) {
      const next = flat[idx + 1];
      this.selectLesson(next.mod.id, next.les.id);
    }
  }

  goToPrevLesson() {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId) || this.state.courses[0];
    if (!course) return;
    const flat = [];
    course.modules.forEach(m => m.lessons.forEach(l => flat.push({ mod: m, les: l })));
    const idx = flat.findIndex(i => i.les.id === this.selectedLessonId);
    if (idx > 0) {
      const prev = flat[idx - 1];
      this.selectLesson(prev.mod.id, prev.les.id);
    }
  }

  toggleCompleteLesson(lessonId) {
    if (!lessonId) return;

    // BLOQUEO ESTRICTO ANTISPAM: Si ya está completada, no hacer nada ni consultar la base de datos
    if (this.state.currentUser.completedLessons.includes(lessonId)) {
      return;
    }

    this.updateState(state => {
      state.currentUser.rewardedXpLessons = state.currentUser.rewardedXpLessons || [];
      state.currentUser.completedLessons.push(lessonId);

      // Entregar XP ÚNICAMENTE la primera vez que completa la lección (Anti-trampa)
      if (!state.currentUser.rewardedXpLessons.includes(lessonId)) {
        state.currentUser.rewardedXpLessons.push(lessonId);
        this.addXP(50);
        this.triggerConfetti();
      }
    });

    this.showToast('✅ ¡Lección completada con éxito! (+50 XP)', 'success');
    this.syncProgressToSupabase(lessonId, true, 0);
  }

  async syncProgressToSupabase(lessonId, isCompleted, quizScore = 0) {
    const supabase = getSupabase();
    if (!supabase || !this.authenticatedUser) return;

    try {
      await supabase.from('student_progress').upsert({
        user_id: this.authenticatedUser.id,
        course_id: this.selectedCourseId || 'course_ehook',
        lesson_id: lessonId,
        completed: isCompleted,
        quiz_score: quizScore,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,course_id,lesson_id' });
    } catch (err) {
      console.warn('Sync progress to Supabase:', err);
    }
  }

  async loadStudentProgressFromSupabase() {
    const supabase = getSupabase();
    if (!supabase || !this.authenticatedUser) return;

    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('user_id', this.authenticatedUser.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const completedFromCloud = data.filter(d => d.completed).map(d => d.lesson_id);
        const passedQuizzesFromCloud = {};
        data.forEach(d => {
          if (d.quiz_score > 0) {
            passedQuizzesFromCloud[d.lesson_id] = d.quiz_score;
          }
        });

        this.updateState(state => {
          const mergedSet = new Set([...state.currentUser.completedLessons, ...completedFromCloud]);
          state.currentUser.completedLessons = Array.from(mergedSet);
          state.currentUser.passedQuizzes = { ...state.currentUser.passedQuizzes, ...passedQuizzesFromCloud };
        });
      }
    } catch (err) {
      console.warn('Load progress from Supabase:', err);
    }
  }

  // ==========================================================================
  // NEWS & ANNOUNCEMENTS VIEW ("Pestaña de Noticias")
  // ==========================================================================

  renderNews() {
    const isAdmin = this.isUserAdmin();
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

  // Sincronizar cambios de un curso con Supabase en tiempo real
  async syncCurrentCourseToSupabase(courseId = null) {
    const targetCourseId = courseId || this.selectedCourseId;
    const course = this.state.courses.find(c => c.id === targetCourseId);
    if (!course) return;

    const supabase = getSupabase();
    if (!supabase || !this.authenticatedUser) return;

    try {
      const { error } = await supabase.from('courses').upsert({
        id: course.id,
        title: course.title,
        subtitle: course.subtitle || '',
        badge: course.badge || 'Oficial & Completo',
        cover_url: course.coverUrl || '',
        creator_id: course.creator_id || this.authenticatedUser.id,
        creator_name: course.creator_name || this.authenticatedUser.fullName || 'Super Admin',
        modules: course.modules,
        updated_at: new Date().toISOString()
      });
      if (error) {
        console.warn('Error al sincronizar curso con Supabase:', error.message);
      } else {
        console.log(`✅ Curso "${course.title}" (${course.id}) actualizado en Supabase.`);
      }
    } catch (err) {
      console.warn('syncCurrentCourseToSupabase error:', err);
    }
  }

  // --- Modal para Editar Título, Descripción y Portada del Curso ---
  openEditCourseModal(courseId = null) {
    const targetCourseId = courseId || this.selectedCourseId;
    const course = this.state.courses.find(c => c.id === targetCourseId);
    if (!course) return;

    const existing = document.getElementById('course-edit-modal-overlay');
    if (existing) existing.remove();

    const root = document.getElementById('admin-modal-root') || document.body;
    const wrapper = document.createElement('div');
    wrapper.id = 'course-edit-modal-overlay';
    wrapper.innerHTML = `
      <div style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem;">
        <div class="admin-panel-card" style="width:100%; max-width:600px; max-height:90vh; overflow-y:auto;">
          <div class="flex-between" style="margin-bottom:1.5rem;">
            <h2>✏️ Editar Información del Curso</h2>
            <button type="button" onclick="document.getElementById('course-edit-modal-overlay').remove()" style="background:none;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer;">✕</button>
          </div>

          <form id="edit-course-form" onsubmit="window.app.handleSaveEditCourse(event, '${course.id}')">
            <div class="form-group" style="margin-bottom:1rem;">
              <label style="display:block; margin-bottom:4px; font-weight:700;">📝 Nombre / Título del Curso</label>
              <input type="text" name="title" class="form-control" value="${course.title}" required style="width:100%; padding:10px; border-radius:var(--radius-md);" />
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label style="display:block; margin-bottom:4px; font-weight:700;">💬 Subtítulo o Descripción Corta</label>
              <textarea name="subtitle" class="form-control" rows="3" required style="width:100%; padding:10px; border-radius:var(--radius-md);">${course.subtitle || ''}</textarea>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label style="display:block; margin-bottom:4px; font-weight:700;">🏷️ Etiqueta / Badge</label>
              <input type="text" name="badge" class="form-control" value="${course.badge || 'Oficial & Completo'}" style="width:100%; padding:10px; border-radius:var(--radius-md);" />
            </div>

            <div class="form-group" style="margin-bottom:1.5rem;">
              <label style="display:block; margin-bottom:4px; font-weight:700;">🖼️ URL de la Imagen de Portada</label>
              <input type="url" name="coverUrl" class="form-control" value="${course.coverUrl || ''}" placeholder="https://..." style="width:100%; padding:10px; border-radius:var(--radius-md);" />
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button type="button" class="btn btn-ghost" onclick="document.getElementById('course-edit-modal-overlay').remove()">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="font-weight:700; padding:10px 20px;">💾 Guardar Cambios en Supabase</button>
            </div>
          </form>
        </div>
      </div>
    `;
    root.appendChild(wrapper);
    if (window.lucide) window.lucide.createIcons();
  }

  async handleSaveEditCourse(e, courseId) {
    e.preventDefault();
    const form = e.target;
    const title = this.sanitizeHTML(form.title.value.trim());
    const subtitle = this.sanitizeHTML(form.subtitle.value.trim());
    const badge = this.sanitizeHTML(form.badge.value.trim());
    const coverUrl = form.coverUrl.value.trim() || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80';

    if (!title) return;

    this.updateState(state => {
      const c = state.courses.find(x => x.id === courseId);
      if (c) {
        c.title = title;
        c.subtitle = subtitle;
        c.badge = badge;
        c.coverUrl = coverUrl;
      }
    });

    await this.syncCurrentCourseToSupabase(courseId);

    const overlay = document.getElementById('course-edit-modal-overlay');
    if (overlay) overlay.remove();

    this.showToast(`✅ Curso "${title}" actualizado correctamente en Supabase`, 'success');
  }

  // --- Renombrar y Eliminar Módulos ---
  renameModule(modId) {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId);
    if (!course) return;
    const mod = course.modules.find(m => m.id === modId);
    if (!mod) return;

    const newTitle = window.prompt('Escribe el nuevo título para este módulo:', mod.title);
    if (newTitle && newTitle.trim() && newTitle.trim() !== mod.title) {
      this.updateState(state => {
        const targetCourse = state.courses.find(c => c.id === this.selectedCourseId);
        const targetMod = targetCourse.modules.find(m => m.id === modId);
        if (targetMod) {
          targetMod.title = this.sanitizeHTML(newTitle.trim());
        }
      });
      this.syncCurrentCourseToSupabase();
      this.showToast('✅ Módulo renombrado correctamente', 'success');
    }
  }

  deleteModule(modId) {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId);
    if (!course) return;
    const mod = course.modules.find(m => m.id === modId);
    if (!mod) return;

    if (!window.confirm(`¿Estás seguro de que deseas eliminar el módulo "${mod.title}" y todas sus lecciones?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    this.updateState(state => {
      const targetCourse = state.courses.find(c => c.id === this.selectedCourseId);
      targetCourse.modules = targetCourse.modules.filter(m => m.id !== modId);
    });
    this.syncCurrentCourseToSupabase();
    this.showToast(`🗑️ Módulo "${mod.title}" eliminado.`, 'success');
  }

  // --- Reordering Methods for Modules and Lessons ---
  moveModuleUp(modId) {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId);
    if (!course) return;
    const idx = course.modules.findIndex(m => m.id === modId);
    if (idx > 0) {
      this.updateState(state => {
        const targetCourse = state.courses.find(c => c.id === this.selectedCourseId);
        const temp = targetCourse.modules[idx];
        targetCourse.modules[idx] = targetCourse.modules[idx - 1];
        targetCourse.modules[idx - 1] = temp;
      });
      this.syncCurrentCourseToSupabase();
      this.showToast('⬆️ Módulo reordenado hacia arriba', 'success');
    }
  }

  moveModuleDown(modId) {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId);
    if (!course) return;
    const idx = course.modules.findIndex(m => m.id === modId);
    if (idx < course.modules.length - 1) {
      this.updateState(state => {
        const targetCourse = state.courses.find(c => c.id === this.selectedCourseId);
        const temp = targetCourse.modules[idx];
        targetCourse.modules[idx] = targetCourse.modules[idx + 1];
        targetCourse.modules[idx + 1] = temp;
      });
      this.syncCurrentCourseToSupabase();
      this.showToast('⬇️ Módulo reordenado hacia abajo', 'success');
    }
  }

  moveLessonUp(modId, lessonId) {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId);
    if (!course) return;
    const mod = course.modules.find(m => m.id === modId);
    if (!mod) return;
    const idx = mod.lessons.findIndex(l => l.id === lessonId);
    if (idx > 0) {
      this.updateState(state => {
        const targetCourse = state.courses.find(c => c.id === this.selectedCourseId);
        const targetMod = targetCourse.modules.find(m => m.id === modId);
        const temp = targetMod.lessons[idx];
        targetMod.lessons[idx] = targetMod.lessons[idx - 1];
        targetMod.lessons[idx - 1] = temp;
      });
      this.syncCurrentCourseToSupabase();
      this.showToast('⬆️ Lección reordenada hacia arriba', 'success');
    }
  }

  moveLessonDown(modId, lessonId) {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId);
    if (!course) return;
    const mod = course.modules.find(m => m.id === modId);
    if (!mod) return;
    const idx = mod.lessons.findIndex(l => l.id === lessonId);
    if (idx < mod.lessons.length - 1) {
      this.updateState(state => {
        const targetCourse = state.courses.find(c => c.id === this.selectedCourseId);
        const targetMod = targetCourse.modules.find(m => m.id === modId);
        const temp = targetMod.lessons[idx];
        targetMod.lessons[idx] = targetMod.lessons[idx + 1];
        targetMod.lessons[idx + 1] = temp;
      });
      this.syncCurrentCourseToSupabase();
      this.showToast('⬇️ Lección reordenada hacia abajo', 'success');
    }
  }

  renderAdminPanel() {
    const course = this.state.courses.find(c => c.id === this.selectedCourseId) || this.state.courses[0];

    return `
      <div class="admin-header">
        <h1>⚙️ Panel de Administración y Creador</h1>
        <p>Edita nombres de cursos, renombra módulos y lecciones, reordena y añade enlaces de video y documentos.</p>
      </div>

      <div class="admin-tabs" style="display:flex; gap:1rem; flex-wrap:wrap;">
        <button class="btn-primary-action" onclick="window.app.openEditCourseModal('${course.id}')" style="background:linear-gradient(135deg, #6366f1, #4f46e5); font-weight:700;">
          <i data-lucide="edit-3"></i> ✏️ Cambiar Nombre del Curso
        </button>
        <button class="btn-nav-step" onclick="window.app.openCreateLessonModal()">
          <i data-lucide="plus-circle"></i> Añadir Nueva Lección con Video
        </button>
        <button class="btn-nav-step" onclick="window.app.openCreateModuleModal()">
          <i data-lucide="folder-plus"></i> Añadir Nuevo Módulo
        </button>
        ${this.isUserSuperAdmin() ? `
          <button class="btn-duplicate-action" onclick="window.app.duplicateCourse('${course.id}')" title="Duplicar este curso completo a la base de datos">
            <i data-lucide="copy"></i> Duplicar Curso a Base de Datos
          </button>
        ` : ''}
        ${(this.isUserSuperAdmin() || (this.authenticatedUser && course.creator_id === this.authenticatedUser.id)) ? `
          <button class="btn-danger-action" onclick="window.app.deleteCourse('${course.id}')" title="Eliminar este curso permanentemente">
            <i data-lucide="trash-2"></i> Eliminar este Curso
          </button>
        ` : ''}
      </div>

      <!-- Manage Lessons Table -->
      <div class="admin-panel-card">
        <div class="flex-between" style="flex-wrap:wrap; gap:10px; margin-bottom:1.25rem; padding-bottom:12px; border-bottom:1px solid var(--border-color);">
          <div>
            <h2 style="margin:0; font-size:1.4rem;">Estructura del Curso: "${course.title}"</h2>
            <p style="margin:4px 0 0 0; color:var(--text-muted); font-size:0.85rem;">Haz clic en "Editar Curso" para cambiar el nombre oficial, subtítulo o imagen.</p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="window.app.openEditCourseModal('${course.id}')" title="Editar nombre, descripción y portada del curso" style="border:1px solid var(--accent-primary); color:var(--accent-primary); font-weight:700; display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:var(--radius-md);">
            <i data-lucide="edit"></i> ✏️ Editar Nombre del Curso
          </button>
        </div>
        
        <div style="margin-top:1.5rem;">
          ${course.modules.map((mod, modIdx) => `
            <div style="margin-bottom:2rem; background:var(--bg-sidebar); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1rem;">
              <div class="flex-between" style="margin-bottom:1rem; padding-bottom:8px; border-bottom:1px solid var(--border-color); flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <h3 style="margin:0;">📦 ${mod.title}</h3>
                  <span style="font-size:0.85rem; color:var(--text-muted);">(${mod.lessons.length} lecciones)</span>
                </div>
                <div style="display:flex; gap:6px; align-items:center;">
                  <button class="btn btn-sm btn-ghost" onclick="window.app.renameModule('${mod.id}')" title="Cambiar nombre de este módulo" style="border:1px solid var(--border-color); font-size:0.8rem;">
                    ✏️ Renombrar
                  </button>
                  <button class="btn btn-sm btn-logout" onclick="window.app.deleteModule('${mod.id}')" title="Eliminar este módulo" style="padding:4px 8px; font-size:0.8rem;">
                    🗑️
                  </button>
                  <button class="btn btn-sm btn-ghost" onclick="window.app.moveModuleUp('${mod.id}')" ${modIdx === 0 ? 'disabled' : ''} title="Mover módulo arriba">
                    ⬆️ Subir
                  </button>
                  <button class="btn btn-sm btn-ghost" onclick="window.app.moveModuleDown('${mod.id}')" ${modIdx === course.modules.length - 1 ? 'disabled' : ''} title="Mover módulo abajo">
                    ⬇️ Bajar
                  </button>
                </div>
              </div>

              <div style="display:flex; flex-direction:column; gap:8px;">
                ${mod.lessons.map((l, lIdx) => `
                  <div class="flex-between" style="padding:10px 14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); flex-wrap:wrap; gap:8px;">
                    <div>
                      <strong>${l.title}</strong>
                      <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
                        🔗 Video Link: <code style="color:var(--accent-primary);">${l.videoUrl || 'Sin video linkeado'}</code>
                      </div>
                    </div>

                    <div style="display:flex; gap:6px; align-items:center;">
                      <button class="btn btn-sm btn-ghost" onclick="window.app.moveLessonUp('${mod.id}', '${l.id}')" ${lIdx === 0 ? 'disabled' : ''} title="Mover lección arriba">
                        ⬆️
                      </button>
                      <button class="btn btn-sm btn-ghost" onclick="window.app.moveLessonDown('${mod.id}', '${l.id}')" ${lIdx === mod.lessons.length - 1 ? 'disabled' : ''} title="Mover lección abajo">
                        ⬇️
                      </button>
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
    this.syncCurrentCourseToSupabase();

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
    this.syncCurrentCourseToSupabase();

    const overlay = document.getElementById('lesson-modal-overlay');
    if (overlay) overlay.remove();
    this.showToast('💾 Cambios guardados correctamente en Supabase', 'success');
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
    this.syncCurrentCourseToSupabase();

    this.showToast('🗑️ Lección eliminada correctamente', 'info');
  }

  openCreateModuleModal() {
    const title = prompt('Ingresa el título del nuevo Módulo:');
    if (!title || !title.trim()) return;

    const newMod = {
      id: `mod_${Date.now()}`,
      title: title.trim(),
      description: 'Nuevo módulo añadido.',
      lessons: []
    };

    this.updateState(state => {
      const course = state.courses.find(c => c.id === this.selectedCourseId);
      if (course) course.modules.push(newMod);
    });
    this.syncCurrentCourseToSupabase();

    this.showToast('✅ Nuevo Módulo creado en Supabase', 'success');
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

    // Atajos de Teclado Globales
    document.addEventListener('keydown', (e) => {
      // Ignorar si el usuario está escribiendo en un input, textarea o formulario
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

      // Ctrl + K o Cmd + K: Abrir buscador
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Atajos activos únicamente al estar viendo una lección
      if (this.currentTab === 'classroom' && this.selectedLessonId) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.goToNextLesson();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.goToPrevLesson();
        } else if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'c') {
          e.preventDefault();
          if (this.selectedLessonId) {
            this.toggleCompleteLesson(this.selectedLessonId);
          }
        } else if (e.key.toLowerCase() === 'f') {
          e.preventDefault();
          this.toggleFocusMode();
        }
      }
    });
  }
}

// Initialize App safely regardless of DOM ready timing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new SkoolApp();
  });
} else {
  window.app = new SkoolApp();
}
